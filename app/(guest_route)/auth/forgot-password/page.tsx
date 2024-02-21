'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      console.log(response);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting forgot password request:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

          {isSubmitted ? (
            <p className="text-green-500 mb-4">Password reset email sent. Check your inbox!</p>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                  onClick={() => handleSubmit}
                >
                  Reset Password
                </button>
              </div>
            </>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => router.push('/auth/login')}
              >
                Log In
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
