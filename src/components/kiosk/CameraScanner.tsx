import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'

export function CameraScanner({
  onScan,
  onError,
}: {
  onScan: (token: string) => void
  onError: (error: string) => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const preview = video.current
    if (!preview) return

    let cancelled = false
    let scanned = false
    let stream: MediaStream | undefined
    let controls: IScannerControls | undefined

    function stopCamera() {
      controls?.stop()
      stream?.getTracks().forEach((track) => track.stop())
    }

    async function startCamera(element: HTMLVideoElement) {
      try {
        if (!window.isSecureContext) {
          onError(
            'Open the kiosk over HTTPS or on localhost to use the camera.',
          )
          return
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          onError('Camera access is unavailable in this browser.')
          return
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stopCamera()
          return
        }

        controls = await new BrowserQRCodeReader().decodeFromStream(
          stream,
          element,
          (result, _error, scanner) => {
            if (!result || cancelled || scanned) return
            scanned = true
            scanner.stop()
            onScan(result.getText())
          },
        )
        if (cancelled) stopCamera()
      } catch (error) {
        stopCamera()
        if (cancelled) return
        const name = error instanceof DOMException ? error.name : ''
        if (name === 'NotAllowedError') {
          onError('Allow camera access in your browser settings and try again.')
        } else if (name === 'NotFoundError') {
          onError('No camera was found. Connect a camera and try again.')
        } else {
          onError(
            'The camera did not start. Close other apps using it and try again.',
          )
        }
      }
    }

    void startCamera(preview)
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [onScan, onError])

  return (
    <div className="mt-4">
      {!playing && (
        <p className="text-sm" role="status">
          Opening camera…
        </p>
      )}
      <video
        ref={video}
        className={
          playing
            ? 'block max-h-65 w-full rounded-lg object-contain'
            : 'sr-only'
        }
        autoPlay
        muted
        playsInline
        onPlaying={() => setPlaying(true)}
        aria-label="QR scanning camera"
      />
    </div>
  )
}
