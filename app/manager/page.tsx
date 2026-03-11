'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { Users, LogOut, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ManagerDashboard() {
  const [subordinates, setSubordinates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  const supabase = createClient()
  const router = useRouter()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: prof } = await supabase.from('user_profiles').select('*, departments(name)').eq('id', user.id).single()
      setProfile(prof)

      const { data: subs } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('manager_id', user.id)

      if (subs) setSubordinates(subs)
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

  const handleAction = async (userId: string, action: 'approved' | 'rejected' | 'pending', role?: string) => {
    const updates: any = { status: action }
    if (role) updates.role = role

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update team member: ' + error.message)
    } else {
      toast.success('Team member updated successfully')
      fetchData()
    }
  }

  const pendingUsers = useMemo(() => subordinates.filter(s => s.status === 'pending'), [subordinates])
  const activeUsers = useMemo(() => subordinates.filter(s => s.status === 'approved'), [subordinates])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Department Manager Portal</h1>
              <p className="text-sm text-gray-500">
                {profile?.departments?.name ? `Managing ${profile.departments.name}` : (loading ? 'Loading...' : '')}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-amber-200 dark:border-amber-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
          <h2 className="text-lg font-semibold mb-4 text-amber-800 dark:text-amber-500 flex items-center gap-2">
            Pending Approvals ({pendingUsers.length})
          </h2>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-amber-50 dark:bg-amber-900/20">
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-gray-500">No pending requests</TableCell>
                  </TableRow>
                )}
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(val) => handleAction(user.id, 'pending', val)}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crc">CRC</SelectItem>
                          <SelectItem value="cra">CRA</SelectItem>
                          <SelectItem value="data_entry">Data Entry</SelectItem>
                          <SelectItem value="recruitment_specialist">Recruitment</SelectItem>
                          <SelectItem value="retention_specialist">Retention</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(user.id, 'approved')}>
                          <CheckCircle className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(user.id, 'rejected')}>
                          <XCircle className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Active Team */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-4">My Team</h2>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-gray-500">No active team members</TableCell>
                  </TableRow>
                )}
                {activeUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs font-medium uppercase">
                        {user.role.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  )
}
