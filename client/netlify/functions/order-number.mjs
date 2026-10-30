import { randomUUID } from 'node:crypto'

export function createOrderNumber() {
  return `MRZ-${randomUUID().replaceAll('-', '').toUpperCase()}`
}

export function getOrderNumber(session) {
  const savedNumber = String(session?.metadata?.order_number || '').trim()
  if (savedNumber) return savedNumber

  const sessionSuffix = String(session?.id || '')
    .replace(/[^a-z\d]/gi, '')
    .slice(-16)
    .toUpperCase()
  return `MRZ-${sessionSuffix || createOrderNumber().slice(4)}`
}