import type { GateEvent } from '../../types/checkin'
import { Button } from '../ui/Button'

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
          <h2 className="text-xl font-semibold">Recent gate activity</h2>
        </div>
        <Button variant="secondary" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
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
                  {event.status}
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
