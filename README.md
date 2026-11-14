# TMC Web

## Tech stack

React, TypeScript, Vite, and Tailwind CSS. ZXing scans QR codes, `qrcode` renders QR, and React-Toastify displays notifications.

## Folder structure

- `src/pages/` — employee sign-in, employee QR code, and kiosk screens.
- `src/components/`, `src/layouts/` — UI components and layouts.
- `src/services/`, `src/types/` — API calls and TypeScript types.
- `public/` — static assets, including the TMC logo.

## How to run

Use Node.js 24 and npm. Start Identity Service on port `8081` and Check-in Service on port `8080`. From the repository root, run:

```bash
npm ci
npm run dev
```

- [Employee sign-in](http://127.0.0.1:5173/employee) — use demo employee ID `1` or `2` and password `1`.
- [Kiosk](http://127.0.0.1:5173/kiosk)
