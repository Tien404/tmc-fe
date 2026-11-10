import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="mb-4 text-3xl font-semibold">Page not found</h1>
      <Link className="text-blue-700 underline" to="/employee">
        Go to employee page
      </Link>
    </section>
  )
}
