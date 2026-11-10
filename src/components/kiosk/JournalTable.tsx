import type { CheckinEvent } from '../../types/checkin'
import { Button } from '../ui/Button'

type JournalTableProps = {
  events: CheckinEvent[]
  onRefresh: () => void
}

export function JournalTable({ events, onRefresh }: JournalTableProps) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Local journal</h2>
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
                  {event.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!events.length && <p className="mt-4 text-slate-500">No scans yet.</p>}
    </section>
  )
}
