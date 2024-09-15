'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Terminal } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function Confirm() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    console.log('Token Hash:', token_hash);
    console.log('Type:', type);

    if (token_hash && type === 'signup') {
      const confirmEmail = async () => {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: 'signup' })

        if (error) {
          console.error('Error confirming email:', error);
          setErrorMessage('Failed to confirm email. Please try again.');
        } else {
          // Email confirmed successfully
          router.replace('/auth/login'); // Redirect to login or your desired page
        }
      };

      confirmEmail();
    } else {
      setErrorMessage('Invalid or missing token.');
    }
  }, [router, supabase, searchParams]);

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Confirming your account</AlertTitle>
    </Alert>
  )
}