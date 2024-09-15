'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPassword() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser(); // Check if the user is logged in
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if the user is not logged in
  useEffect(() => {
    if (!user) {
      setMessage('You must be logged in to reset your password.');
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Check if passwords match
    if (password !== passwordRepeat) {
      setMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Update the user's password directly
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage('Password updated successfully. Redirecting to login...');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below to reset your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && <p className="text-center text-sm mb-4">{message}</p>}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <Label htmlFor="passwordRepeat">Repeat New Password</Label>
              <Input
                id="passwordRepeat"
                type="password"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}