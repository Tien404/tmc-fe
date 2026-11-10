import { useCallback, useEffect, useRef, useState } from 'react'
import { api, message } from '../services/api'
import type { CheckinEvent } from '../types/checkin'
import { Button } from '../components/ui/Button'
import { JournalTable } from '../components/kiosk/JournalTable'
import { CameraScanner } from '../components/kiosk/CameraScanner'

export function KioskPage() {
  const [token, setToken] = useState('')
  const [direction, setDirection] = useState('IN')
  const [scanning, setScanning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<CheckinEvent | null>(null)
  const [error, setError] = useState('')
  const [events, setEvents] = useState<CheckinEvent[]>([])
  const submitting = useRef(false)

  const loadEvents = useCallback(async () => {
    setEvents(await api<CheckinEvent[]>('/checkin/api/events'))
  }, [])

  useEffect(() => {
    api<CheckinEvent[]>('/checkin/api/events')
      .then(setEvents)
      .catch((e) => setError(message(e)))
  }, [])

  const checkIn = useCallback(
    async (value: string) => {
      if (submitting.current || !value.trim()) return
      submitting.current = true
      setBusy(true)
      setResult(null)
      setError('')
      try {
        setResult(
          await api<CheckinEvent>('/checkin/api/checkins', {
            token: value.trim(),
            direction,
          }),
        )
      } catch (e) {
        setError(message(e))
      } finally {
        try {
          await loadEvents()
        } catch {
          setError((previous) => previous || 'Unable to load the journal')
        }
        submitting.current = false
        setBusy(false)
      }
    },
    [direction, loadEvents],
  )

  const onScan = useCallback(
    (value: string) => {
      setScanning(false)
      setToken(value)
      void checkIn(value)
    },
    [checkIn],
  )

  const onCameraError = useCallback((value: string) => {
    setScanning(false)
    setError(
      `Unable to open the camera: ${value}. You can paste a token below.`,
    )
  }, [])

  return (
    <>
      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-semibold">Kiosk check-in</h1>
        <p className="mb-4 leading-relaxed text-slate-600">
          Binh Duong kiosk · Factory 1 · Gate 1 · Online verification
        </p>
      </header>
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-semibold">Scan entry / exit</h2>
        <p className="mb-4 leading-relaxed text-slate-600">
          Gate opening is simulated in this local demo.
        </p>
        <label className="block font-semibold">
          Direction
          <select
            className="mt-2 mb-4 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal focus:border-blue-500 focus:outline-2 focus:outline-blue-200 disabled:bg-slate-100"
            value={direction}
            disabled={busy || scanning}
            onChange={(e) => setDirection(e.target.value)}
          >
            <option value="IN">Entry</option>
            <option value="OUT">Exit</option>
          </select>
        </label>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            setError('')
            setScanning((v) => !v)
          }}
        >
          {scanning ? 'Stop camera' : 'Scan with camera'}
        </Button>
        {scanning && <CameraScanner onScan={onScan} onError={onCameraError} />}
        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault()
            void checkIn(token)
          }}
        >
          <label className="block font-semibold">
            Token QR
            <textarea
              className="mt-2 mb-4 w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-sm font-normal wrap-anywhere focus:border-blue-500 focus:outline-2 focus:outline-blue-200"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={4}
              placeholder="Scan a QR code or paste a token copied from the employee page"
              required
            />
          </label>
          <Button type="submit" disabled={busy || scanning || !token.trim()}>
            {busy ? 'Verifying…' : 'Verify and check in'}
          </Button>
        </form>
        {error && (
          <p className="my-3 text-red-700" role="alert">
            {error}
          </p>
        )}
        {result && (
          <div
            role="status"
            className={
              result.status === 'OPENED'
                ? 'mt-5 rounded-lg bg-emerald-50 p-4 text-emerald-800'
                : 'mt-5 rounded-lg bg-red-50 p-4 text-red-800'
            }
          >
            <strong>
              {result.status === 'OPENED'
                ? 'Allowed · Simulated gate opened'
                : 'Denied · Gate remains closed'}
            </strong>
            <p className="mt-2 leading-relaxed">
              {result.employeeName} {result.message}
            </p>
          </div>
        )}
      </section>
      <JournalTable
        events={events}
        onRefresh={() => {
          void loadEvents().catch((e: unknown) => setError(message(e)))
        }}
      />
    </>
  )
}
