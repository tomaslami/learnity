import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createPaymentPreference } from '@/lib/services/payment.service';

// Zod schema for request body validation
const CreatePreferenceRequestSchema = z.object({
  courseId: z.string().uuid({ message: "Invalid Course ID format." }),
});

export async function POST(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client for the route handler
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If you are using cookies in an API Route, your CookieOptions must have the `path` option set to `/`
          request.cookies.set({ ...options, name, value, path: '/' });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          supabaseResponse.cookies.set({ ...options, name, value, path: '/' });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ ...options, name, value: '', path: '/' });
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          });
          supabaseResponse.cookies.set({ ...options, name, value: '', path: '/' });
        },
      },
    }
  );

  // 1. Authenticate User
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Authentication error in create-preference API:', authError);
    return NextResponse.json({ message: 'Unauthorized: You must be logged in to create a payment preference.' }, { status: 401 });
  }
  const userId = user.id;

  // 2. Validate Request Body
  let parsedBody;
  try {
    const body = await request.json();
    parsedBody = CreatePreferenceRequestSchema.safeParse(body);
  } catch (e) {
    console.error('Error parsing request body:', e);
    return NextResponse.json({ message: 'Invalid request body: Could not parse JSON.' }, { status: 400 });
  }

  if (!parsedBody.success) {
    console.log('Validation failed for create-preference request:', parsedBody.error.flatten().fieldErrors);
    return NextResponse.json(
      { 
        message: 'Invalid request data.',
        errors: parsedBody.error.flatten().fieldErrors 
      }, 
      { status: 400 }
    );
  }
  const { courseId } = parsedBody.data;

  // 3. Call Payment Service
  try {
    const paymentResult = await createPaymentPreference(courseId, userId);

    if (paymentResult.success && paymentResult.preferenceId && paymentResult.init_point) {
      return NextResponse.json(
        {
          preferenceId: paymentResult.preferenceId,
          init_point: paymentResult.init_point,
          message: 'Payment preference created successfully.',
        },
        { status: 200 }
      );
    } else {
      console.error('Error from createPaymentPreference service:', paymentResult.message, paymentResult.error);
      return NextResponse.json(
        { 
          message: paymentResult.message || 'Failed to create payment preference.',
          errorDetails: paymentResult.error?.details || paymentResult.error,
        }, 
        { status: 500 } // Or a more specific error code if available
      );
    }
  } catch (serviceError: any) {
    console.error('Unexpected error calling createPaymentPreference service:', serviceError);
    return NextResponse.json(
        { message: 'An unexpected error occurred on the server.', errorDetails: serviceError.message }, 
        { status: 500 }
    );
  }
}
