"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { loginUserAction } from '@/app/actions/auth.actions';
import { useRouter } from 'next/navigation'; // Corrected import for useRouter

const initialState = {
  success: false,
  message: '',
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
    >
      {pending ? 'Signing In...' : 'Sign In'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginUserAction, initialState);
  const router = useRouter();

  useEffect(() => {
    // The redirect is handled by the server action itself.
    // This useEffect is mainly for displaying messages or if client-side redirect was needed.
    if (state.success) {
      // alert(state.message); // Optional: show success message before redirect
      // router.push('/dashboard'); // Redirect is now in server action
    } else if (state.message && !state.errors) {
      // Show general error messages (e.g., "Invalid email or password")
      alert(`Login Failed: ${state.message}`);
    }
  }, [state, router]);

  const getErrorForField = (fieldName: string): string | undefined => {
    return state.errors?.find(err => err.path.includes(fieldName))?.message;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900">Sign In</h1>
        
        {/* Display general non-field error messages from the server */}
        {state.message && !state.success && (!state.errors || state.errors.length === 0) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>{state.message}</p>
          </div>
        )}
        
        {/* Display success message (though redirect usually happens before this is seen) */}
        {state.success && state.message && (
           <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
             <p>{state.message}</p>
           </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email" // Name attribute is crucial for FormData
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              aria-describedby="email-error"
            />
            {getErrorForField('email') && (
              <p id="email-error" className="mt-2 text-sm text-red-600">
                {getErrorForField('email')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password" // Name attribute is crucial for FormData
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              aria-describedby="password-error"
            />
            {getErrorForField('password') && (
              <p id="password-error" className="mt-2 text-sm text-red-600">
                {getErrorForField('password')}
              </p>
            )}
          </div>
          
          <SubmitButton />
        </form>

        <div className="mt-6 text-center">
          <Link href="/register" legacyBehavior>
            <a className="text-sm text-indigo-600 hover:text-indigo-500">
              Don&apos;t have an account? Register
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
