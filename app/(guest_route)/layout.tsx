import React, { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';

export default async function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    console.log(session?.user);
    redirect('/learn');
  }
  return <>{children}</>;
}
