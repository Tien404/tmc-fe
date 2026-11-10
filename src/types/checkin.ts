export type CheckinEvent = {
  id: string
  employeeId: number | null
  employeeName: string | null
  gateId: number
  factoryId: number
  direction: string
  status: string
  message: string
  occurredAt: string
}
