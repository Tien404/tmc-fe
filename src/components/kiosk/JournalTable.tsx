import type { GateEvent } from '../../types/checkin'
import { Button } from '../ui/Button'
import { Check, RefreshCw, X } from 'lucide-react'

type JournalTableProps = {
  events: GateEvent[]
  error?: string
  onRefresh: () => void
}

export function JournalTable({ events, error, onRefresh }: JournalTableProps) {
  return (
    <section className="panel journal-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="gate-activity-heading" className="text-xl font-semibold">
            Recent gate activity
          </h2>
        </div>
        <Button className="gap-2" variant="secondary" onClick={onRefresh}>
          <RefreshCw aria-hidden="true" className="size-4 shrink-0" />
          Refresh
        </Button>
      </div>
      <div
        className="mt-5 max-h-[min(28rem,55dvh)] overflow-auto focus-visible:outline-2 focus-visible:outline-emerald-700"
        role="region"
        aria-labelledby="gate-activity-heading"
        tabIndex={0}
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 text-slate-600">
            <tr>
              {['Time', 'Employee', 'Direction', 'Result', 'Message'].map(
                (label) => (
                  <th
                    key={label}
                    className="border-b border-slate-200 px-3 py-3 font-semibold"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="border-b border-slate-200 px-3 py-3 whitespace-nowrap">
                  {new Date(event.occurredAt).toLocaleString('en-GB')}
                </td>
                <td className="border-b border-slate-200 px-3 py-3">
                  {event.employeeName ?? '—'}
                </td>
                <td className="border-b border-slate-200 px-3 py-3">
                  {event.direction === 'IN' ? 'Entry' : 'Exit'}
                </td>
                <td className="border-b border-slate-200 px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                      event.status === 'OPENED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : event.status === 'DENIED'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {event.status === 'OPENED' && (
                      <Check aria-hidden="true" className="size-3.5 shrink-0" />
                    )}
                    {event.status === 'DENIED' && (
                      <X aria-hidden="true" className="size-3.5 shrink-0" />
                    )}
                    {event.status}
                  </span>
                </td>
                <td className="border-b border-slate-200 px-3 py-3">
                  {event.source === 'MANUAL_OVERRIDE'
                    ? 'Manual override'
                    : event.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && (
        <p className="mt-4 text-red-700" role="alert">
          {error}
        </p>
      )}
      {!error && !events.length && (
        <p className="mt-4 text-slate-500">
          No scans yet. Your next check-in will appear here.
        </p>
      )}
    </section>
  )
}
