import { Button } from '../components/ui/Button'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { api } from '../services/api'

import type { Employee, GeneratedQR } from '../types/employee'

export function EmployeeQrPage({
  employee,
  onSignOut,
}: {
  employee: Employee
  onSignOut: () => void
}) {
  const [qr, setQr] = useState<GeneratedQR | null>(null)
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [copiedToken, setCopiedToken] = useState('')

  useEffect(() => {
    let cancelled = false
    async function generate() {
      try {
        const result = await api<GeneratedQR>(
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
      void generate()
    }, 30_000)
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
          End session
        </Button>
      </header>
      <div className="qr-layout">
        <section className="panel qr-panel">
          <p className="mb-4 text-slate-600">
            Hold this code in front of the gate camera.
          </p>
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
          {qr && (
            <p className="mb-4 text-slate-600">
              Expires at: {new Date(qr.expiresAt).toLocaleTimeString('en-GB')}
            </p>
          )}
          {(qr || loadFailed) && (
            <Button
              variant="secondary"
              onClick={() => setRefresh((value) => value + 1)}
            >
              {loadFailed ? 'Try again' : 'Refresh QR code'}
            </Button>
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
