import type { VosConfig } from '../storage'
import { loadSacApps } from '../storage'
import { Mi } from '../../Mi'
import {
  TerminalApp,
  CalculatorApp,
  NotesApp,
  FilesApp,
  NavigatorApp,
  SettingsApp,
  MusicApp,
  GalleryApp,
  CalendarApp,
  MailApp,
  ClockApp,
  WeatherApp,
  MessagesApp,
  MonitorApp,
  PaintApp,
} from './CommonApps'
import VisualPixelStudio from './VisualPixelStudio'
import FPixelStore from './FPixelStore'
import SacApp from './SacApp'
import SacConsole from './SacConsole'
import EmojiPicker from './EmojiPicker'
import { TextDoc, FolderView } from './DeskDocs'

export function renderVosApp(
  appId: string,
  config: VosConfig,
  launch: (appId: string) => void,
): React.ReactNode {
  if (appId.startsWith('sac:')) {
    const pkg = appId.slice(4)
    const app = loadSacApps().find((a) => a.pkg === pkg)
    if (app) return <SacApp app={app} />
  }

  if (appId.startsWith('text:')) return <TextDoc itemId={appId.slice(5)} />
  if (appId.startsWith('folder:')) return <FolderView itemId={appId.slice(7)} />

  switch (appId) {
    case 'sac':
      return <SacConsole />
    case 'emoji':
      return <EmojiPicker />
    case 'vps':
      return <VisualPixelStudio />
    case 'fpixel':
      return <FPixelStore />
    case 'sac-installed':
      return <SacInstalledList launch={launch} />
    case 'terminal':
      return <TerminalApp />
    case 'files':
      return <FilesApp />
    case 'navigator':
      return <NavigatorApp />
    case 'notes':
      return <NotesApp />
    case 'calculator':
      return <CalculatorApp />
    case 'music':
      return <MusicApp />
    case 'gallery':
      return <GalleryApp />
    case 'calendar':
      return <CalendarApp />
    case 'mail':
      return <MailApp />
    case 'clock':
      return <ClockApp />
    case 'weather':
      return <WeatherApp />
    case 'messages':
      return <MessagesApp />
    case 'monitor':
      return <MonitorApp />
    case 'paint':
      return <PaintApp />
    case 'settings':
      return <SettingsApp config={config} />
    default:
      return (
        <div style={{ padding: 24, color: '#a6adc8' }}>
          App non trovata: {appId}
          <button onClick={() => launch('fpixel')}>Apri lo Store</button>
        </div>
      )
  }
}

/* Lista delle app installate con SAC */
function SacInstalledList({ launch }: { launch: (id: string) => void }) {
  const apps = loadSacApps()
  if (apps.length === 0) {
    return (
      <div className="sac-empty">
        <Mi n="android" />
        <b>Nessuna app installata con SAC</b>
        <p>Apri lo Store F-Pixel e premi il pulsante di download su un'app per installarla qui.</p>
        <button className="vps-btn" onClick={() => launch('fpixel')}>
          <Mi n="shop" /> Apri lo Store
        </button>
      </div>
    )
  }
  return (
    <div className="sac-mine">
      {apps.map((a) => (
        <button key={a.pkg} className="sac-mine-row" onClick={() => launch(`sac:${a.pkg}`)}>
          {a.icon ? (
            <img src={a.icon} alt="" />
          ) : (
            <span className="sac-icon sac-icon-fb">
              <Mi n="android" />
            </span>
          )}
          <div>
            <b>{a.name}</b>
            <small>{a.pkg}</small>
          </div>
          <Mi n="arrow_forward" />
        </button>
      ))}
    </div>
  )
}
