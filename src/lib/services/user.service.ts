import type { RegisterSchemaType, LoginSchemaType } from '@/lib/validators/auth';
import { createUserInRepository, signInUserInRepository } from '@/lib/repository/user.repository';
import type { User } from '@supabase/supabase-js';

// Define a type for the service function arguments, excluding confirmPassword
type RegisterUserServiceParams = Omit<RegisterSchemaType, 'confirmPassword'>;

export async function registerUserInService(data: RegisterUserServiceParams): Promise<{
  success: boolean;
  userId?: string;
  message?: string;
  error?: { message: string; details?: any }; // Standardized error object
}> {
  console.log('registerUserInService called with:', data);

  try {
    const repositoryResponse = await createUserInRepository(data);

    if (repositoryResponse.error) {
      console.error('Error from createUserInRepository:', repositoryResponse.error);
      let userMessage = "Registration failed. Please try again later.";
      if (repositoryResponse.error.message) {
        if (repositoryResponse.error.message.includes('User already registered')) {
          userMessage = 'This email is already registered. Please try logging in.';
        } else if (repositoryResponse.error.message.includes('Password should be at least 6 characters')) {
            userMessage = 'Password should be at least 6 characters long.';
        } else if (repositoryResponse.error.message.includes('check your email')) { 
            userMessage = repositoryResponse.error.message; 
        } else {
            userMessage = `Registration failed: ${repositoryResponse.error.message}`;
        }
      }
      
      return {
        success: false,
        message: userMessage,
        error: {
          message: userMessage,
          details: repositoryResponse.error.details || repositoryResponse.error,
        },
      };
    }

    if (repositoryResponse.data && repositoryResponse.data.userId) {
      return {
        success: true,
        userId: repositoryResponse.data.userId,
        message: 'User registered successfully. Please check your email to confirm your account.',
      };
    }

    return {
      success: false,
      message: 'Registration failed due to an unexpected issue. No user ID was returned.',
      error: { message: 'No user ID returned from repository without explicit error.' },
    };

  } catch (e) {
    console.error('Unexpected error in registerUserInService:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred during registration: ${errorMessage}`,
      error: { message: `Unexpected error: ${errorMessage}`, details: e },
    };
  }
}

export async function signOutUserService(): Promise<{
  success: boolean;
  message: string;
}> {
  console.log('signOutUserService called');

  try {
    const { error } = await signOutUserRepository();

    if (error) {
      console.error('Error from signOutUserRepository:', error);
      return {
        success: false,
        message: `Logout failed: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Logout successful.',
    };

  } catch (e) {
    console.error('Unexpected error in signOutUserService:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred during logout: ${errorMessage}`,
    };
  }
}

export async function signInUserInService(data: LoginSchemaType): Promise<{
  success: boolean;
  user?: User; // User object from Supabase
  message?: string;
  error?: { message: string; details?: any };
}> {
  console.log('signInUserInService called with email:', data.email);

  try {
    const repositoryResponse = await signInUserInRepository(data);

    if (repositoryResponse.error) {
      console.error('Error from signInUserInRepository:', repositoryResponse.error);
      
      let userMessage = "Invalid email or password."; // Generic default
      // Supabase specific error messages for login:
      // - "Invalid login credentials"
      // - "Email not confirmed"
      if (repositoryResponse.error.message && repositoryResponse.error.message.toLowerCase().includes('email not confirmed')) {
        userMessage = "Please confirm your email before logging in.";
      }
      // For other errors, we stick to the generic "Invalid email or password."
      
      return {
        success: false,
        message: userMessage,
        error: {
          message: userMessage, 
          details: repositoryResponse.error.details || repositoryResponse.error.message, 
        },
      };
    }

    if (repositoryResponse.data && repositoryResponse.data.user) {
      return {
        success: true,
        user: repositoryResponse.data.user,
        message: 'Login successful!',
      };
    }

    // Fallback for unexpected cases where user data might be missing without an explicit error
    return {
      success: false,
      message: 'Login failed due to an unexpected issue. Please try again.',
      error: { message: 'No user data returned from repository without an explicit error.' },
    };

  } catch (e) {
    console.error('Unexpected error in signInUserInService:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred during login: ${errorMessage}`,
      error: { message: `Unexpected error: ${errorMessage}`, details: e },
    };
  }
}
