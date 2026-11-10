import { NavLink, Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <nav
        className="mb-8 flex flex-wrap items-center gap-3"
        aria-label="Main navigation"
      >
        <span className="mr-auto font-bold text-blue-700">TMC · M2</span>
        {['employee', 'kiosk'].map((page) => (
          <NavLink
            key={page}
            to={`/${page}`}
            className={({ isActive }) =>
              `rounded-lg px-4 py-2.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${isActive ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-200'}`
            }
          >
            {page === 'employee' ? 'Employee' : 'Kiosk'}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </main>
  )
}
