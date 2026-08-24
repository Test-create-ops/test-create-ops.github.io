import { useState } from 'react'
import { Mi } from '../../Mi'
import { getSacLogs, clearSacLogs, type SacLogEntry } from './sacLog'
import { loadSacApps } from '../storage'

export default function SacConsole() {
  const [logs] = useState<SacLogEntry[]>(() => [...getSacLogs()].reverse())
  const [cleared, setCleared] = useState(false)
  const apps = loadSacApps()
  const last = logs.find((l) => l.level !== 'info')
  const lastOk = logs.some((l) => l.msg.includes('Installazione completata'))

  return (
    <div className="sacc">
      {/* ── Versione semplice (in alto così la trova tutti) ── */}
      <div className="sacc-easy">
        <div className="sacc-easy-head">
          <Mi n="smart_toy" />
          <b>SAC · System APK Converter</b>
        </div>
        <p>
          SAC prende le app di F-Droid e le prepara per VOS. Al momento installa
          una <b>versione template</b> dell'app: legge nome, icona e permessi veri
          dall'APK. Il codice interno non viene convertito (arriverà con APK Reader).
        </p>
        <div className="sacc-status">
          <span className="sacc-dot ok" />
          App installate finora: <b>{apps.length}</b>
          {last && (
            <>
              <span className="sacc-dot err" />
              Ultimo tentativo:{' '}
              <b className={lastOk ? 'ok' : 'err'}>
                {lastOk ? 'riuscito' : 'fallito'}
              </b>
            </>
          )}
        </div>
        <p className="sacc-hint">
          Se un'installazione fallisce, guarda il registro tecnico qui sotto
          e mandalo a chi ti aiuta.
        </p>
      </div>

      {/* ── Divider tra versione semplice e dev ── */}
      <div className="sacc-divider">
        <span>VERSIONE DEV</span>
      </div>

      {/* ── Log tecnico ── */}
      <div className="sacc-dev">
        <div className="sacc-dev-head">
          <b>SAC LOG — modalità sviluppatore</b>
          <button
            className="sacc-clear"
            onClick={() => {
              clearSacLogs()
              setCleared(true)
            }}
          >
            <Mi n="delete" /> Svuota log
          </button>
        </div>
        <div className="sacc-logbox">
          {(cleared || logs.length === 0) && (
            <div className="sacc-line info">— nessun evento registrato —</div>
          )}
          {!cleared &&
            logs.map((l, i) => {
              const d = new Date(l.t)
              const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
              return (
                <div key={i} className={`sacc-line ${l.level}`}>
                  [{time}] {l.msg}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
