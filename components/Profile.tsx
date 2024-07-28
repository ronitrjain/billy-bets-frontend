'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export default function Profile() {
  const supabase = useSupabaseClient()
  const user = useUser()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) alert(error.message)
  }

  return (
    <div>
      <p>Logged in as: {user?.email}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}