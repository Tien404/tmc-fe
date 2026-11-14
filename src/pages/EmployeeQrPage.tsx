import { Button } from '../components/ui/Button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { api } from '../services/api'

import type { Employee, QRCodeData } from '../types/employee'

const QR_REFRESH_SECONDS = 30

export function EmployeeQrPage({
  employee,
  onSignOut,
}: {
  employee: Employee
  onSignOut: () => void
}) {
  const [qr, setQr] = useState<QRCodeData | null>(null)
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [secondsUntilRefresh, setSecondsUntilRefresh] =
    useState(QR_REFRESH_SECONDS)
  const [copiedToken, setCopiedToken] = useState('')

  useEffect(() => {
    let cancelled = false
    let nextRefreshAt = performance.now() + QR_REFRESH_SECONDS * 1000
    async function generate() {
      try {
        const result = await api<QRCodeData>(
          `/identity/api/employees/${employee.id}/qr`,
          {},
        )
        const dataUrl = await QRCode.toDataURL(result.token, {
          width: 300,
          margin: 2,
        })
        if (cancelled) return
        setQr(result)
        setImage(dataUrl)
        setError('')
        setLoadFailed(false)
      } catch {
        if (!cancelled) {
          setLoadFailed(true)
          const detail = 'Unable to load your QR code. Please try again.'
          setError(detail)
          toast.error(detail, { toastId: detail })
          setQr(null)
          setImage('')
        }
      }
    }
    void generate()
    const timer = window.setInterval(() => {
      const now = performance.now()
      if (now >= nextRefreshAt) {
        nextRefreshAt = now + QR_REFRESH_SECONDS * 1000
        void generate()
      }
      setSecondsUntilRefresh(Math.ceil((nextRefreshAt - now) / 1000))
    }, 1000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [employee.id, refresh])

  async function copyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token)
      setCopiedToken(token)
    } catch {
      const detail = 'Unable to copy the token. Select and copy it manually.'
      setError(detail)
      toast.error(detail, { toastId: detail })
    }
  }

  return (
    <>
      <header className="page-heading flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1>Employee QR code</h1>
          <p className="leading-relaxed text-slate-600">
            {employee.name} · Factory {employee.factoryId}
          </p>
        </div>
        <Button variant="secondary" onClick={onSignOut}>
          Log out
        </Button>
      </header>
      <div className="qr-layout">
        <section className="panel qr-panel">
          <p className="text-slate-600">Hold in front of kiosk camera.</p>
          <p className="min-h-lh mb-3 text-sm text-red-700">
            {error &&
              (loadFailed
                ? 'Could not load QR code.'
                : 'Could not copy token.')}
          </p>
          {!image && !loadFailed && (
            <div className="qr-placeholder" role="status">
              Preparing your access code…
            </div>
          )}
          {image && (
            <img
              className="qr-image"
              src={image}
              alt="Employee check-in QR code"
            />
          )}
          {(qr || loadFailed) && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
              {qr && (
                <p className="text-slate-600">
                  Auto-refresh in{' '}
                  <span className="tabular-nums">{secondsUntilRefresh}s</span>.
                </p>
              )}
              <Button
                className="gap-2"
                variant="secondary"
                onClick={() => {
                  setSecondsUntilRefresh(QR_REFRESH_SECONDS)
                  setRefresh((value) => value + 1)
                }}
              >
                <RefreshCw aria-hidden="true" className="size-4 shrink-0" />
                {loadFailed ? 'Try again' : 'Refresh now'}
              </Button>
            </div>
          )}
          {qr && (
            <details className="mt-5">
              <summary className="cursor-pointer">QR code token</summary>
              <textarea
                className="mt-3 mb-3 w-full rounded-lg border border-slate-300 p-2.5"
                readOnly
                rows={2}
                value={qr.token}
                aria-label="QR code token"
              />
              <Button
                variant="secondary"
                onClick={() => void copyToken(qr.token)}
              >
                {copiedToken === qr.token ? 'Copied' : 'Copy token'}
              </Button>
            </details>
          )}
        </section>
      </div>
    </>
  )
}
