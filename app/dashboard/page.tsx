'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, LogOut, FileText, Activity, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StaffDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const router = useRouter()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: prof } = await supabase
        .from('user_profiles')
        .select(`
          *,
          departments(name),
          manager:user_profiles!manager_id(first_name, last_name)
        `)
        .eq('id', user.id)
        .single()

      setProfile(prof)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {profile?.first_name} {profile?.last_name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="md:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">My Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role:</span>
                <span className="font-medium uppercase">{profile?.role?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Department:</span>
                <span className="font-medium">{profile?.departments?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reporting To:</span>
                <span className="font-medium">{profile?.manager?.first_name} {profile?.manager?.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions / Modules */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-indigo-200 transition-colors cursor-pointer group">
              <FileText className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-4" />
              <h3 className="font-semibold text-lg">My Assignments</h3>
              <p className="text-sm text-gray-500 mt-1">View protocols, studies, or tasks assigned to you by your manager.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-indigo-200 transition-colors cursor-pointer group">
              <Activity className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-4" />
              <h3 className="font-semibold text-lg">Data Entry & Logs</h3>
              <p className="text-sm text-gray-500 mt-1">Submit new clinical data, logs, or reports relevant to your role.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-indigo-200 transition-colors cursor-pointer group">
              <Settings className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-4" />
              <h3 className="font-semibold text-lg">Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Adjust app theme, notification preferences, and language.</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
