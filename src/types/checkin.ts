export type GateEvent = {
  id: string
  employeeId: number | null
  employeeName: string | null
  gateId: number
  factoryId: number
  direction: string
  status: string
  message: string
  source?: string
  guardId?: string | null
  reason?: string | null
  occurredAt: string
}
