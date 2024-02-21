import React from 'react';
import { Button, Html, Text, Hr, Heading } from '@react-email/components';

export default function ForgotPasswordEmail({ params }: { params: { name: string; url: string } }) {
  return (
    <Html>
      <Heading as="h2">Hello {params.name}</Heading>;
      <Text>We received the reset password request. if it&apos;s not you then pls ignore it.</Text>
      <Button
        href={params.url}
        style={{ background: '#000', color: '#FFFFFF', padding: '10px 20px' }}
      >
        Reset Password
      </Button>
      <Hr />
      <Heading as="h3">Regards</Heading>
      <Text>Somykoron Team</Text>
    </Html>
  );
}
