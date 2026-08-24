import type { VosConfig } from '../storage'
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

export function renderVosApp(
  appId: string,
  config: VosConfig,
  launch: (appId: string) => void,
): React.ReactNode {
  switch (appId) {
    case 'vps':
      return <VisualPixelStudio />
    case 'fpixel':
      return <FPixelStore />
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
