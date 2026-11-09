import { Button } from '../components/ui/Button'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { api, message } from '../services/api'

import type { Employee, GeneratedQR } from '../types/employee'

export function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState(1)
  const [qr, setQr] = useState<GeneratedQR | null>(null)
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api<Employee[]>('/identity/api/employees')
      .then(setEmployees)
      .catch((e: unknown) => setError(message(e)))
  }, [])

  useEffect(() => {
    let cancelled = false
    async function generate() {
      try {
        const result = await api<GeneratedQR>(
          `/identity/api/employees/${employeeId}/qr`,
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
        setCopied(false)
      } catch (e) {
        if (!cancelled) {
          setError(message(e))
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
  }, [employeeId, refresh])

  async function copyToken() {
    if (!qr) return
    try {
      await navigator.clipboard.writeText(qr.token)
      setCopied(true)
    } catch {
      setError('Copy failed. Select and copy the token below.')
    }
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-semibold">Employee QR code</h1>
        <p className="mb-4 leading-relaxed text-slate-600">
          Select a demo employee to generate an entry or exit QR code.
        </p>
      </header>
      <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="mb-3 text-xl font-semibold">Your QR code</h2>
        <p className="mb-4 leading-relaxed text-slate-600">
          Refreshes every 30 seconds. Valid for 60 seconds and one scan.
        </p>
        <label className="block font-semibold">
          Employee
          <select
            className="mt-2 mb-4 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal focus:border-blue-500 focus:outline-2 focus:outline-blue-200"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(Number(e.target.value))
              setQr(null)
              setImage('')
              setError('')
              setCopied(false)
            }}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · Factory {e.factoryId}
                {e.active ? '' : ' · Inactive'}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="my-3 text-red-700" role="alert">
            {error}
          </p>
        )}
        {image && (
          <img
            className="mx-auto my-4 block w-75 max-w-full"
            src={image}
            alt="Employee check-in QR code"
          />
        )}
        {qr && (
          <>
            <p className="mb-4 leading-relaxed text-slate-600">
              Expires at: {new Date(qr.expiresAt).toLocaleTimeString('en-GB')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  void copyToken()
                }}
              >
                {copied ? 'Copied' : 'Copy token'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setRefresh((v) => v + 1)}
              >
                Generate new QR
              </Button>
            </div>
            <details className="mt-5">
              <summary className="cursor-pointer text-slate-600">
                Token for manual testing at the kiosk
              </summary>
              <textarea
                className="mt-3 w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-sm wrap-anywhere focus:border-blue-500 focus:outline-2 focus:outline-blue-200"
                readOnly
                value={qr.token}
                rows={4}
                aria-label="Employee QR token"
              />
            </details>
          </>
        )}
      </section>
    </>
  )
}
