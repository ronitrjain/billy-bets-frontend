'use client'

import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to manage form submission
  const supabase = useSupabaseClient()
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true); // Disable button
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      console.log('Sign-up successful:', data);
      alert('Check your email for the confirmation link!');
    } catch (error: any) {
      console.error('Full error object:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      router.push('/'); // Redirect to /chat after successful login
    }
    setIsSubmitting(false); // Re-enable button
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true); // Disable button
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      alert('Password reset email sent. Check your inbox.');
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error('Full error object:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  const renderForm = () => {
    if (isForgotPassword) {
      return (
        <form onSubmit={handleForgotPassword}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      )
    }

    return (
      <form onSubmit={isLogin ? handleSignIn : handleSignUp}>
        <div className="grid gap-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input 
                  id="first-name" 
                  placeholder="Max" 
                  required 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input 
                  id="last-name" 
                  placeholder="Robinson" 
                  required 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              {isLogin && (
                <Link href="#" className="ml-auto inline-block text-sm underline" onClick={() => setIsForgotPassword(true)}>
                  Forgot your password?
                </Link>
              )}
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Create an account')}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isForgotPassword ? 'Forgot Password' : (isLogin ? 'Login' : 'Sign Up')}
          </CardTitle>
          <CardDescription>
            {isForgotPassword
              ? 'Enter your email to reset your password'
              : (isLogin 
                  ? 'Enter your email below to login to your account'
                  : 'Enter your information to create an account'
                )
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderForm()}
          {!isForgotPassword && (
            <div className="mt-4 text-center text-sm">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link href="#" className="underline" onClick={() => setIsLogin(false)}>
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href="#" className="underline" onClick={() => setIsLogin(true)}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
          )}
          {isForgotPassword && (
            <div className="mt-4 text-center text-sm">
              <Link href="#" className="underline" onClick={() => setIsForgotPassword(false)}>
                Back to login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}