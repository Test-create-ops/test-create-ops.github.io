import { useState } from 'react'
import BootScreen from './BootScreen'
import SetupScreen from './SetupScreen'
import LockScreen from './LockScreen'
import Desktop from './Desktop'
import { loadVosConfig, saveVosConfig, type VosConfig } from './storage'

export type VosPhase = 'boot' | 'setup' | 'lock' | 'desktop'

export default function VOS({ onExit }: { onExit: () => void }) {
  const saved = loadVosConfig()
  const [phase, setPhase] = useState<VosPhase>(() => {
    if (!saved.setupComplete) return 'boot'
    return 'boot'
  })
  const [config, setConfig] = useState<VosConfig>(saved)

  function afterBoot() {
    if (config.setupComplete) setPhase('lock')
    else setPhase('setup')
  }

  function completeSetup(c: VosConfig) {
    saveVosConfig(c)
    setConfig(c)
    setPhase('lock')
  }

  return (
    <div className="vos-root">
      {phase === 'boot' && <BootScreen onDone={afterBoot} />}
      {phase === 'setup' && <SetupScreen onComplete={completeSetup} />}
      {phase === 'lock' && <LockScreen config={config} onUnlock={() => setPhase('desktop')} />}
      {phase === 'desktop' && (
        <Desktop config={config} onLock={() => setPhase('lock')} onExit={onExit} />
      )}
    </div>
  )
}
