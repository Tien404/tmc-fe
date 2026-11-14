import { ManualCheckInForm } from '../components/kiosk/ManualCheckInForm'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import type { GateEvent } from '../types/checkin'
import { Button } from '../components/ui/Button'
import { toast } from 'react-toastify'
import { JournalTable } from '../components/kiosk/JournalTable'
import { CameraScanner } from '../components/kiosk/CameraScanner'

export function KioskPage() {
  const [direction, setDirection] = useState('IN')
  const [scanning, setScanning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<GateEvent | null>(null)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  const [events, setEvents] = useState<GateEvent[]>([])
  const [journalError, setJournalError] = useState('')
  const [token, setToken] = useState('')

  const journalRequest = useRef(0)

  const loadEvents = useCallback(() => {
    const request = ++journalRequest.current
    return api<GateEvent[]>('/checkin/api/events').then(
      (entries) => {
        if (request !== journalRequest.current) return
        setEvents(entries)
        setJournalError('')
      },
      () => {
        if (request !== journalRequest.current) return
        setJournalError('Unable to load recent gate activity.')
      },
    )
  }, [])

  useEffect(() => {
    void loadEvents()
    return () => {
      journalRequest.current += 1
    }
  }, [loadEvents])

  const checkIn = useCallback(
    async (value: string) => {
      if (submitting.current || !value.trim()) return
      submitting.current = true
      setBusy(true)
      setResult(null)
      setError('')
      try {
        setResult(
          await api<GateEvent>('/checkin/api/checkins', {
            token: value.trim(),
            direction,
          }),
        )
      } catch {
        const detail = 'Unable to verify your QR code. Please scan again.'
        setError(detail)
        toast.error(detail, { toastId: detail })
      } finally {
        await loadEvents()
        submitting.current = false
        setBusy(false)
      }
    },
    [direction, loadEvents],
  )

  const onScan = useCallback(
    (value: string) => {
      setScanning(false)
      setToken('')
      void checkIn(value)
    },
    [checkIn],
  )

  const onCameraError = useCallback((detail: string) => {
    setScanning(false)
    setError(detail)
    toast.error(detail, { toastId: detail })
  }, [])

  return (
    <>
      <header className="page-heading">
        <h1>Kiosk check-in</h1>
        <p className="mb-4 leading-relaxed text-slate-600">
          Binh Duong · Factory 1 · Gate 1
        </p>
      </header>
      <div className="kiosk-layout">
        <section className="panel kiosk-panel">
          <h2 className="section-title">Scan your QR code</h2>
          <p className="mb-4 leading-relaxed text-slate-600">
            Select Entry or Exit before scanning.
          </p>
          <label className="block font-semibold">
            Direction
            <select
              className="mt-2 mb-4 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal focus:border-emerald-600 focus:outline-2 focus:outline-emerald-200 disabled:bg-slate-100"
              value={direction}
              disabled={busy || scanning}
              onChange={(e) => {
                setDirection(e.target.value)
                setResult(null)
                setError('')
              }}
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
              setResult(null)
              setScanning((v) => !v)
            }}
          >
            {scanning ? 'Stop camera' : 'Scan with camera'}
          </Button>
          {scanning && (
            <CameraScanner onScan={onScan} onError={onCameraError} />
          )}
          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault()
              void checkIn(token)
              setToken('')
            }}
          >
            <label className="block font-semibold">
              QR code token
              <textarea
                className="mt-2 mb-3 w-full rounded-lg border border-slate-300 p-2.5"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                rows={2}
                disabled={busy || scanning}
              />
            </label>
            <Button type="submit" disabled={busy || scanning || !token.trim()}>
              Verify code
            </Button>
          </form>
          <div className="mt-3 min-h-[1lh] text-sm">
            {error ? (
              <p className="text-red-700">QR check-in failed.</p>
            ) : (
              <p role="status">{busy ? 'Verifying your QR code…' : ''}</p>
            )}
          </div>
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
                  ? direction === 'IN'
                    ? 'Entry recorded'
                    : 'Exit recorded'
                  : 'Access denied'}
              </strong>
              <p className="mt-2 leading-relaxed">
                {result.status === 'OPENED'
                  ? 'You may proceed.'
                  : 'Use a current employee QR code and try again.'}
              </p>
            </div>
          )}
          <ManualCheckInForm onRecorded={() => void loadEvents()} />
        </section>
        <JournalTable
          events={events}
          error={journalError}
          onRefresh={() => void loadEvents()}
        />
      </div>
    </>
  )
}
