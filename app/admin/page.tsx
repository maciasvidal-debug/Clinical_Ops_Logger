'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ShieldAlert, LogOut, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [departments, setDepartments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptDesc, setNewDeptDesc] = useState('')

  const supabase = createClient()
  const router = useRouter()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: deptData } = await supabase.from('departments').select('*')
    if (deptData) setDepartments(deptData)

    const { data: userData } = await supabase.from('user_profiles').select(`
      *,
      departments(name)
    `)
    if (userData) setUsers(userData)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    setTimeout(() => {
      void fetchData()
    }, 0)
  }, [fetchData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeptName) return

    const { error } = await supabase.from('departments').insert([{
      name: newDeptName,
      description: newDeptDesc
    }])

    if (error) {
      toast.error('Failed to create department: ' + error.message)
    } else {
      toast.success('Department created')
      setNewDeptName('')
      setNewDeptDesc('')
      fetchData()
    }
  }

  const updateUserRoleOrStatus = async (userId: string, updates: any) => {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update user: ' + error.message)
    } else {
      toast.success('User updated successfully')
      fetchData()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Console</h1>
              <p className="text-sm text-gray-500">System-wide configuration and user management</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Departments Management */}
          <div className="md:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold mb-4">Manage Departments</h2>

            <form onSubmit={handleCreateDepartment} className="space-y-4 mb-8">
              <div>
                <Label htmlFor="deptName">Department Name</Label>
                <Input id="deptName" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="deptDesc">Description</Label>
                <Input id="deptDesc" value={newDeptDesc} onChange={e => setNewDeptDesc(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Create Department</Button>
            </form>

            <h3 className="font-medium text-sm text-gray-500 mb-2">Existing Departments</h3>
            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {departments.map(dept => (
                <li key={dept.id} className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm">
                  <span className="font-semibold block">{dept.name}</span>
                  <span className="text-xs text-gray-500">{dept.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* User Management */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold mb-4">All Users</h2>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">No users found</TableCell>
                    </TableRow>
                  )}
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </TableCell>
                      <TableCell>{user.departments?.name || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(val: string) => updateUserRoleOrStatus(user.id, { role: val })}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="crc">CRC</SelectItem>
                            <SelectItem value="cra">CRA</SelectItem>
                            <SelectItem value="data_entry">Data Entry</SelectItem>
                            <SelectItem value="recruitment_specialist">Recruitment</SelectItem>
                            <SelectItem value="retention_specialist">Retention</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'approved' ? 'bg-green-100 text-green-800' :
                          user.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.status !== 'approved' && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => updateUserRoleOrStatus(user.id, { status: 'approved' })}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {user.status !== 'rejected' && user.role !== 'super_admin' && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => updateUserRoleOrStatus(user.id, { status: 'rejected' })}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
