"use client";

import React, { useState, useTransition } from 'react';

interface PurchaseButtonProps {
  courseId: string;
  courseTitle: string; // For display purposes, e.g. in alerts
  price: number | null | undefined;
}

export default function PurchaseButton({ courseId, courseTitle, price }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition(); // For concurrent rendering updates

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    if (price === null || price === undefined || price <= 0) {
        alert("This course cannot be purchased as its price is not set or is invalid.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/payment/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors (e.g., validation, server errors from the API route)
        const errorMessage = data.message || `Failed to create payment preference. Status: ${response.status}`;
        console.error('API Error:', data.errors || data.errorDetails || errorMessage);
        setError(errorMessage);
        alert(`Error: ${errorMessage}`);
      } else {
        // On success, redirect to Mercado Pago's init_point
        if (data.init_point) {
          startTransition(() => {
            window.location.href = data.init_point;
          });
        } else {
          setError('Could not get payment URL. Please try again.');
          alert('Error: Could not get payment URL.');
        }
      }
    } catch (networkError: any) {
      // Handle network errors or issues with the fetch call itself
      console.error('Network or fetch error:', networkError);
      const message = `A network error occurred: ${networkError.message || 'Please check your connection and try again.'}`;
      setError(message);
      alert(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || isPending}
        className="w-full px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading || isPending ? 'Processing...' : `Purchase Course`}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
