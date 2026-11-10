import { useEffect, useRef } from 'react'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import { message } from '../../services/api'

export function CameraScanner({
  onScan,
  onError,
}: {
  onScan: (token: string) => void
  onError: (error: string) => void
}) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let cancelled = false
    let controls: IScannerControls | undefined
    const reader = new BrowserQRCodeReader()
    void reader
      .decodeFromVideoDevice(
        undefined,
        video.current!,
        (result, _error, scanner) => {
          if (!result || cancelled) return
          scanner.stop()
          onScan(result.getText())
        },
      )
      .then((scanner) => {
        controls = scanner
        if (cancelled) scanner.stop()
      })
      .catch((error) => {
        if (!cancelled) onError(message(error))
      })
    return () => {
      cancelled = true
      controls?.stop()
    }
  }, [onScan, onError])

  return (
    <video
      ref={video}
      className="mt-4 block max-h-65 w-full rounded-lg bg-slate-900"
      muted
      playsInline
      aria-label="QR scanning camera"
    />
  )
}
