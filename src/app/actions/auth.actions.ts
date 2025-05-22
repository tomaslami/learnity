"use server";

import { registerSchema, loginSchema, type LoginSchemaType } from '@/lib/validators/auth';
import { registerUserInService, signInUserInService } from '@/lib/services/user.service';
import { z } from 'zod';
import { redirect } from 'next/navigation';

export async function registerUserAction(
  prevState: any, 
  formData: FormData
): Promise<{
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  userId?: string;
}> {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    role: formData.get('role') as "student" | "professional",
  };

  const validationResult = registerSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.log('Validation failed (register):', validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check your input.",
      errors: validationResult.error.issues,
    };
  }

  const { confirmPassword, ...serviceData } = validationResult.data;

  try {
    const serviceResponse = await registerUserInService(serviceData);

    if (serviceResponse.success) {
      return {
        success: true,
        message: serviceResponse.message || 'User registered successfully!',
        userId: serviceResponse.userId,
      };
    } else {
      return {
        success: false,
        message: serviceResponse.message || 'Registration failed at the service level.',
        // Use the error structure from the service if available
        errors: serviceResponse.error?.message ? [{ path: ["service"], message: serviceResponse.error.message }] : [],
      };
    }
  } catch (error) {
    console.error('Error in registerUserAction:', error);
    let errorMessage = 'An unexpected error occurred during registration.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
      errors: [{ path: ["server"], message: "An unexpected server error occurred." }],
    };
  }
}


export async function loginUserAction(
  prevState: any, 
  formData: FormData
): Promise<{
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
}> {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validationResult = loginSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.log('Validation failed (login):', validationResult.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check your email and password.",
      errors: validationResult.error.issues,
    };
  }

  try {
    const serviceResponse = await signInUserInService(validationResult.data as LoginSchemaType);

    if (serviceResponse.success && serviceResponse.user) {
      // Successful login
      // For now, redirect all users to /dashboard
      // Role-based redirection (e.g. /professional/dashboard) can be added later
      // The middleware should handle session refresh and persistence.
    } else {
      // Login failed (e.g., invalid credentials, email not confirmed)
      return {
        success: false,
        message: serviceResponse.message || "Login failed. Please try again.",
        // We don't want to leak specific field errors for login, just a general message.
        // errors: serviceResponse.error ? [{ path: ["credentials"], message: serviceResponse.message || "Invalid credentials" }] : [],
      };
    }
  } catch (error) {
    console.error('Error in loginUserAction:', error);
    // Handle unexpected errors
    let errorMessage = 'An unexpected error occurred during login.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
      // errors: [{ path: ["server"], message: "An unexpected server error occurred." }],
    };
  }
  // If login was successful, this part will be reached.
  // The redirect needs to be called outside the try/catch to avoid "NEXT_REDIRECT" error being caught.
  redirect('/dashboard'); 
}

export async function logoutUserAction(): Promise<void> {
  console.log('logoutUserAction called');
  try {
    const serviceResponse = await signOutUserService();
    if (!serviceResponse.success) {
      // Log the error on the server. 
      // For a logout action, we typically redirect regardless,
      // as the user's intent is to be logged out.
      console.error('Logout failed in service:', serviceResponse.message);
    }
  } catch (error) {
    // Catch any unexpected errors during the logout process
    console.error('Unexpected error in logoutUserAction:', error);
  }
  // Always redirect to /login after attempting logout
  redirect('/login');
}
