import { DirectionPicker } from '../components/kiosk/DirectionPicker'
import { ManualCheckInForm } from '../components/kiosk/ManualCheckInForm'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import type { GateEvent } from '../types/checkin'
import { Button } from '../components/ui/Button'
import { Camera } from 'lucide-react'
import { toast } from 'react-toastify'
import { JournalTable } from '../components/kiosk/JournalTable'
import { CameraScanner } from '../components/kiosk/CameraScanner'

export function KioskPage() {
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN')
  const [mode, setMode] = useState<'qr' | 'manual'>('qr')
  const [manualBusy, setManualBusy] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<GateEvent | null>(null)
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
      const pendingToast = toast.loading('Verifying your QR code…')
      try {
        setResult(
          await api<GateEvent>('/checkin/api/checkins', {
            token: value.trim(),
            direction,
          }),
        )
      } catch {
        const detail = 'Unable to verify your QR code. Please scan again.'
        toast.error(detail, { toastId: detail })
      } finally {
        toast.dismiss(pendingToast)
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
    toast.error(detail, { toastId: detail })
  }, [])

  return (
    <>
      <header className="page-heading">
        <h1>Kiosk check-in</h1>
        <p className="leading-relaxed text-slate-600">
          Binh Duong · Factory 1 · Gate 1
        </p>
      </header>
      <div className="kiosk-layout">
        <section className="panel kiosk-panel">
          <div
            className="check-in-modes"
            role="group"
            aria-label="Check-in mode"
          >
            <button
              type="button"
              aria-pressed={mode === 'qr'}
              disabled={manualBusy}
              onClick={() => setMode('qr')}
            >
              QR check-in
            </button>
            <button
              type="button"
              aria-pressed={mode === 'manual'}
              disabled={busy}
              onClick={() => {
                setScanning(false)
                setMode('manual')
              }}
            >
              Manual
            </button>
          </div>
          {mode === 'qr' ? (
            <>
              <div className="qr-scan-heading mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <h2 className="section-title">Scan your QR code</h2>
                <Button
                  className="ml-auto shrink-0 gap-2"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    setResult(null)
                    setScanning((value) => !value)
                  }}
                >
                  <Camera aria-hidden="true" className="size-4 shrink-0" />
                  {scanning ? 'Stop camera' : 'Open camera'}
                </Button>
              </div>
              <div className="mb-4">
                <DirectionPicker
                  name="scanDirection"
                  selected={direction}
                  disabled={busy || scanning}
                  onChange={(value) => {
                    setDirection(value)
                    setResult(null)
                  }}
                />
              </div>
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
                    className="mt-2 mb-3 w-full rounded-lg border border-slate-300 p-2"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    rows={2}
                    disabled={busy || scanning}
                  />
                </label>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={busy || scanning || !token.trim()}
                  >
                    Verify code
                  </Button>
                </div>
              </form>
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
            </>
          ) : (
            <ManualCheckInForm
              busy={manualBusy}
              onBusyChange={setManualBusy}
              onRecorded={() => void loadEvents()}
            />
          )}
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
