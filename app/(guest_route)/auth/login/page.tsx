'use client';
import LoginComponent from '@/components/Login';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Import Axios
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState<string>('');

  const handleLogin = async (email: string, password: string) => {
    try {
      setError('');
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.status === 200) {
        await signIn('credentials', {
          email: email,
          password: password,
          callbackUrl: '/learn',
          reload: true,
          redirect: true,
        });
        router.push('/dashboard');
      } else {
        setError(response.data.message || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error during login:', error.message || 'Unknown error');
      // Set error state based on the caught error
      setError(error.message || 'Unknown error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginComponent onLogin={handleLogin} error={error} onGoogleSignIn={() => signIn('google')} />
    </div>
  );
};

export default Login;
