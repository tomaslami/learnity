"use client";

import React, { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { registerUserAction } from '@/app/actions/auth.actions';
import type { ZodIssue } from 'zod';

const initialState = {
  success: false,
  message: '',
  errors: undefined,
  userId: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
    >
      {pending ? 'Registering...' : 'Register'}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerUserAction, initialState);
  const [role, setRole] = React.useState<'student' | 'professional'>('student');

  useEffect(() => {
    if (state.success && state.userId) {
      alert(`Registration successful! User ID: ${state.userId}. Message: ${state.message}`);
      // Here you might want to redirect the user or clear the form
      // For now, we'll just show an alert.
    } else if (!state.success && state.message && !state.errors) {
      // Show general error messages if no specific field errors
      alert(`Registration failed: ${state.message}`);
    }
  }, [state]);

  const getErrorForField = (fieldName: string): string | undefined => {
    return state.errors?.find(err => err.path.includes(fieldName))?.message;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900">Create Your Account</h1>
        
        {/* Display general non-field error messages from the server (e.g. service error) */}
        {state.message && !state.success && !state.errors?.some(e => e.path.length > 0) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>{state.message}</p>
          </div>
        )}
        
        {/* Display success message */}
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
              name="email"
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
              name="password"
              type="password"
              autoComplete="new-password"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              aria-describedby="confirmPassword-error"
            />
            {getErrorForField('confirmPassword') && (
              <p id="confirmPassword-error" className="mt-2 text-sm text-red-600">
                {getErrorForField('confirmPassword')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <div className="flex items-center space-x-6">
                <div className="flex items-center">
                    <input
                    id="role-student"
                    name="role" // Name attribute is crucial for FormData
                    type="radio"
                    value="student" // Ensure value is lowercase to match Zod enum
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                    htmlFor="role-student"
                    className="ml-2 block text-sm text-gray-900"
                    >
                    Student
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                    id="role-professional"
                    name="role" // Name attribute is crucial for FormData
                    type="radio"
                    value="professional" // Ensure value is lowercase to match Zod enum
                    checked={role === 'professional'}
                    onChange={() => setRole('professional')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                    htmlFor="role-professional"
                    className="ml-2 block text-sm text-gray-900"
                    >
                    Professional
                    </label>
                </div>
            </div>
            {getErrorForField('role') && (
              <p id="role-error" className="mt-2 text-sm text-red-600">
                {getErrorForField('role')}
              </p>
            )}
          </div>
          
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
