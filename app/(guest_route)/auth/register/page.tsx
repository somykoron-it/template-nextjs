'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import RegisterComponent from '@/components/Register';
import { signIn } from 'next-auth/react';

const Register = () => {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      if (response.status === 201) {
        router.push('login');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <RegisterComponent
        onRegister={handleRegister}
        onGoogleSignIn={() => signIn('google')}
        error={error}
      />
    </div>
  );
};

export default Register;
