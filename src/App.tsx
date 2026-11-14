import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { EmployeeLoginPage } from './pages/EmployeeLoginPage'
import { EmployeeQrPage } from './pages/EmployeeQrPage'
import { KioskPage } from './pages/KioskPage'
import { NotFoundPage } from './pages/NotFoundPage'
import type { Employee } from './types/employee'

const employeeSessionKey = 'tmc.demoEmployee'

function readEmployeeSession(): Employee | null {
  try {
    return JSON.parse(
      sessionStorage.getItem(employeeSessionKey) ?? 'null',
    ) as Employee | null
  } catch {
    return null
  }
}

export default function App() {
  const [employee, setEmployee] = useState(readEmployeeSession)

  function signIn(selected: Employee) {
    sessionStorage.setItem(employeeSessionKey, JSON.stringify(selected))
    setEmployee(selected)
  }

  function signOut() {
    sessionStorage.removeItem(employeeSessionKey)
    setEmployee(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/employee" replace />} />
          <Route path="/employee">
            <Route
              index
              element={
                employee ? (
                  <Navigate to="qr" replace />
                ) : (
                  <EmployeeLoginPage onSignIn={signIn} />
                )
              }
            />
            <Route
              path="qr"
              element={
                employee ? (
                  <EmployeeQrPage employee={employee} onSignOut={signOut} />
                ) : (
                  <Navigate to="/employee" replace />
                )
              }
            />
          </Route>
          <Route path="/kiosk" element={<KioskPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
