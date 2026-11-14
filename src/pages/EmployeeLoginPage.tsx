import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { toast } from 'react-toastify'
import { api } from '../services/api'
import type { Employee } from '../types/employee'

export function EmployeeLoginPage({
  onSignIn,
}: {
  onSignIn: (employee: Employee) => void
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function signIn(form: FormData) {
    if (busy) return
    const employeeId = form.get('employeeId')
    if (typeof employeeId !== 'string' || !employeeId.trim()) return
    const id = Number(employeeId.trim())
    if (form.get('password') !== '1') {
      const detail = 'Incorrect password.'
      setError(detail)
      toast.error(detail, { toastId: detail })
      return
    }
    setBusy(true)
    setError('')
    try {
      const employees = await api<Employee[]>('/identity/api/employees')
      const employee = employees.find(
        (entry) => entry.id === id && entry.active,
      )
      if (!employee) {
        const detail =
          'Employee ID not found or inactive. Check your ID and try again.'
        setError(detail)
        toast.error(detail, { toastId: detail })
        return
      }
      onSignIn(employee)
    } catch {
      const detail = 'Unable to verify your employee ID. Please try again.'
      setError(detail)
      toast.error(detail, { toastId: detail })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="login-layout">
      <div className="login-form panel">
        <h1 className="form-title">Employee sign in</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void signIn(new FormData(event.currentTarget))
          }}
        >
          <label className="block font-semibold">
            Employee ID
            <input
              className="mt-2 mb-4 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal focus:border-emerald-600 focus:outline-2 focus:outline-emerald-200"
              name="employeeId"
              inputMode="numeric"
              pattern="[0-9]+"
              required
              disabled={busy}
              onChange={() => setError('')}
            />
          </label>
          <label className="block font-semibold">
            Password
            <input
              className="mt-2 mb-4 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal focus:border-emerald-600 focus:outline-2 focus:outline-emerald-200"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={busy}
              onChange={() => setError('')}
            />
          </label>
          <p className="min-h-[1lh] mb-2 text-sm text-red-700">
            {error &&
              (error === 'Incorrect password.' ? error : 'Sign-in failed.')}
          </p>
          <Button type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </section>
  )
}
