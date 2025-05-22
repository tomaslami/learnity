import { NextResponse, type NextRequest } from 'next/server';
import { handlePaymentWebhook } from '@/lib/services/payment.service';

// This is a very basic form of security. 
// In a production environment, you should implement full signature verification
// as described in Mercado Pago's documentation:
// https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks#3-configure-sua-url-e-eventos
// The SDK might provide utilities for this.
function isValidWebhookOrigin(request: NextRequest): boolean {
  // For this example, we'll just check for a specific header or a secret query parameter.
  // Mercado Pago usually sends an 'x-request-id' and 'x-signature'.
  // A simple check could be for 'x-request-id' existence.
  // A better approach would be a shared secret in a query param or signature validation.
  const requestId = request.headers.get('x-request-id');
  const userAgent = request.headers.get('user-agent'); // Often "MercadoPago-HttpClient/1.0" or similar

  if (requestId && userAgent && userAgent.toLowerCase().includes('mercadopago')) {
    console.log(`Webhook request received with x-request-id: ${requestId} and User-Agent: ${userAgent}`);
    return true;
  }
  
  // Fallback or alternative: check for a secret in query params
  // const secret = request.nextUrl.searchParams.get('secret');
  // if (secret === process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
  //   return true;
  // }

  console.warn('Webhook request failed basic validation (missing x-request-id or invalid User-Agent).', {
    'x-request-id': requestId,
    'user-agent': userAgent,
  });
  return false;
}

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/payment/webhook');
  
  // Log all headers for debugging (especially useful for signature verification later)
  // request.headers.forEach((value, key) => {
  //   console.log(`Header: ${key} = ${value}`);
  // });

  // Basic security check - enhance this for production
  if (!isValidWebhookOrigin(request)) {
    // Not logging body here as it might be from an unknown source
    return NextResponse.json({ message: 'Unauthorized webhook request.' }, { status: 403 });
  }

  let webhookData;
  try {
    webhookData = await request.json();
  } catch (e) {
    console.error('Error parsing webhook request body:', e);
    return NextResponse.json({ message: 'Invalid request body: Could not parse JSON.' }, { status: 400 });
  }

  // Asynchronously process the webhook to ensure a quick response to Mercado Pago
  // No `await` here for the main processing, but this means error handling for MP becomes tricky.
  // For now, processing synchronously to return accurate status based on processing.
  try {
    const result = await handlePaymentWebhook(webhookData);

    if (result.success) {
      console.log('Webhook processed successfully by service:', result.message);
      return NextResponse.json({ message: result.message || 'Webhook received and processed.' }, { status: 200 });
    } else {
      console.error('Webhook processing failed by service:', result.message, result.error);
      // Determine appropriate status code based on error if possible
      return NextResponse.json(
        { message: result.message || 'Webhook processing failed.', errorDetails: result.error }, 
        { status: 500 } // Or 400 if it's a client-side issue from the webhook data itself
      );
    }
  } catch (serviceError: any) {
    console.error('Unexpected error calling handlePaymentWebhook service:', serviceError);
    return NextResponse.json(
        { message: 'An unexpected server error occurred during webhook processing.', errorDetails: serviceError.message }, 
        { status: 500 }
    );
  }
}
