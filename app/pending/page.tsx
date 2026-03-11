'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Clock, LogOut } from 'lucide-react'

export default function PendingPage() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white dark:bg-zinc-900 p-10 shadow-xl text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 p-4">
            <Clock className="h-12 w-12 text-amber-600 animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Account Pending</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your registration is complete, but your account is waiting for approval from your Manager.
          </p>
          <p className="text-sm text-gray-400 bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg">
            You will be able to access your dashboard once a manager reviews and approves your request.
            If you believe this is taking too long, please contact your department manager directly.
          </p>
        </div>

        <Button onClick={handleLogout} variant="outline" className="w-full mt-8">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  )
}
