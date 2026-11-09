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
  const data: unknown = await response.json()
  if (!response.ok) {
    const error =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : 'Request failed'
    throw new Error(error)
  }
  return data as T
}

export function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Unable to connect to the service'
}
