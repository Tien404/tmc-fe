import { Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <main className="app-shell">
      <header className="main-nav">
        <div className="p-3">
          <img
            src={`${import.meta.env.BASE_URL}tmc-logo.svg`}
            alt="TinMinh Corp"
            width={104}
            height={31}
          />
        </div>
      </header>
      <Outlet />
    </main>
  )
}
