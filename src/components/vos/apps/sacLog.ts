/* ── SAC Log: registro di tutte le operazioni SAC ── */
export interface SacLogEntry {
  t: number
  msg: string
  level: 'info' | 'ok' | 'err'
}

const LOG_KEY = 'kairo-vos-sac-logs'
const MAX_LOGS = 200

export function sacLog(msg: string, level: SacLogEntry['level'] = 'info'): void {
  const raw = localStorage.getItem(LOG_KEY)
  let logs: SacLogEntry[] = []
  try {
    if (raw) logs = JSON.parse(raw)
  } catch {
    /* ignore */
  }
  logs.push({ t: Date.now(), msg, level })
  if (logs.length > MAX_LOGS) logs = logs.slice(-MAX_LOGS)
  localStorage.setItem(LOG_KEY, JSON.stringify(logs))
}

export function getSacLogs(): SacLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

export function clearSacLogs(): void {
  localStorage.removeItem(LOG_KEY)
}
