import { useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../../services/api'
import type { GateEvent } from '../../types/checkin'
import { Button } from '../ui/Button'

export function ManualCheckInForm({ onRecorded }: { onRecorded: () => void }) {
  const [busy, setBusy] = useState(false)

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form)
    const payload = Object.fromEntries(data)
    const passcodeInput = form.querySelector<HTMLInputElement>(
      'input[name="passcode"]',
    )
    if (passcodeInput) passcodeInput.value = ''
    setBusy(true)
    try {
      await api<GateEvent>('/checkin/api/manual-checkins', {
        ...payload,
        employeeId: Number(payload.employeeId),
      })
      form.reset()
      toast.success('Manual gate operation recorded.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Manual operation failed.',
      )
    } finally {
      setBusy(false)
      onRecorded()
    }
  }

  return (
    <details className="mt-6">
      <summary className="cursor-pointer font-semibold">
        Manual gate operation
      </summary>
      <form
        className="mt-3 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!busy) void submit(event.currentTarget)
        }}
      >
        <fieldset disabled={busy} className="grid gap-3">
          <p className="text-sm">
            Verify the employee badge in person before continuing.
          </p>
          <label>
            Guard ID{' '}
            <input
              className="mt-1 block w-full border p-2"
              name="guardId"
              required
              maxLength={80}
            />
          </label>
          <label>
            Guard passcode{' '}
            <input
              className="mt-1 block w-full border p-2"
              name="passcode"
              type="password"
              required
              maxLength={256}
            />
          </label>
          <label>
            Employee ID{' '}
            <input
              className="mt-1 block w-full border p-2"
              name="employeeId"
              type="number"
              min={1}
              max={2147483647}
              required
            />
          </label>
          <label>
            Direction{' '}
            <select className="mt-1 block w-full border p-2" name="direction">
              <option value="IN">Entry</option>
              <option value="OUT">Exit</option>
            </select>
          </label>
          <label>
            Reason{' '}
            <textarea
              className="mt-1 block w-full border p-2"
              name="reason"
              required
              maxLength={240}
            />
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? 'Recording…' : 'Open gate manually'}
          </Button>
        </fieldset>
      </form>
    </details>
  )
}
