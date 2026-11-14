export async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(
    path,
    body === undefined
      ? undefined
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  )
  const data: unknown = await response.json().catch(() => undefined)
  if (!response.ok) {
    const error =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : requestError(path, response.status)
    throw new Error(error)
  }
  if (data === undefined) {
    throw new Error('The service returned an invalid response.')
  }
  return data as T
}

function requestError(path: string, status: number) {
  const service = path.startsWith('/identity/') ? 'Identity' : 'Check-in'
  const request = `${service} request failed (HTTP ${status}).`
  return status >= 500
    ? `${request} Check that the ${service} service is running.`
    : request
}

export function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Unable to connect to the service'
}
