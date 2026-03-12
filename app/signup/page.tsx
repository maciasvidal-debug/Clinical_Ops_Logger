'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Step = 1 | 2;
type Role = 'crc' | 'cra' | 'data_entry' | 'recruitment_specialist' | 'retention_specialist'

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<Role>('crc')

  const [departments, setDepartments] = useState<any[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<string>('')

  const [managers, setManagers] = useState<any[]>([])
  const [selectedManagerId, setSelectedManagerId] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchDepartments = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('departments').select('*')
      if (data) setDepartments(data)
    }
    fetchDepartments()
  }, [])

  useEffect(() => {
    const fetchManagers = async () => {
      if (!selectedDeptId) {
        setManagers([])
        return
      }
      const supabase = createClient()
      const { data } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, role')
        .eq('department_id', selectedDeptId)
        .eq('role', 'manager')
        .eq('status', 'approved')

      if (data) setManagers(data)
    }
    fetchManagers()
  }, [selectedDeptId])

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !firstName || !lastName || !role) {
      toast.error('Please fill in all basic fields')
      return
    }
    setStep(2)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (departments.length > 0 && (!selectedDeptId || !selectedManagerId)) {
      toast.error('You must select a department and a manager')
      return
    }

    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
            department_id: selectedDeptId || null,
            manager_id: selectedManagerId || null,
          }
        }
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Registration successful! Waiting for manager approval.')
        router.push('/pending')
      }
    } catch {
      toast.error('An error occurred during signup.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-3xl"></div>
      </div>

      <div className={`w-full max-w-md z-10 transition-all duration-500 ease-in-out ${step === 2 ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
        <div className="space-y-6 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-8 shadow-xl border border-white/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create an account</h2>
            <p className="text-sm text-gray-500 mt-2">Step 1: Basic Information</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleNext}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="role">Requested Role</Label>
              <Select value={role} onValueChange={(val) => setRole(val as Role)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crc">Clinical Research Coordinator (CRC)</SelectItem>
                  <SelectItem value="cra">Clinical Research Associate (CRA)</SelectItem>
                  <SelectItem value="data_entry">Data Entry Specialist</SelectItem>
                  <SelectItem value="recruitment_specialist">Recruitment Specialist</SelectItem>
                  <SelectItem value="retention_specialist">Retention Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full mt-4">Continue</Button>

            <div className="text-center text-sm pt-4">
              Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
            </div>
          </form>
        </div>
      </div>

      <div className={`absolute inset-0 flex items-center justify-center p-4 z-20 transition-all duration-500 ease-in-out ${step === 1 ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setStep(1)}></div>

        <div className="relative w-full max-w-lg rounded-3xl bg-card text-card-foreground border border-border p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Select your Manager</h2>
            <p className="text-muted-foreground mt-2">Please identify your reporting structure to complete registration.</p>
          </div>

          {departments.length === 0 ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-200 dark:border-blue-900">
                <p className="font-semibold mb-1">System Initialization Mode</p>
                <p>No departments or managers are configured yet. You will be registered as the first user.</p>
                <p className="mt-2">After registration, please contact your database administrator or update your profile role to super_admin manually to begin setting up the system.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg" disabled={loading} onClick={handleSignup}>
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={selectedDeptId} onValueChange={(val) => { setSelectedDeptId(val); setSelectedManagerId(''); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Direct Manager</Label>
                <Select value={selectedManagerId} onValueChange={setSelectedManagerId} disabled={!selectedDeptId}>
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedDeptId ? "Select department first" : (managers.length === 0 ? "No managers found" : "Select manager")} />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map(mgr => (
                      <SelectItem key={mgr.id} value={mgr.id}>{mgr.first_name} {mgr.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg" disabled={loading || !selectedManagerId}>
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
