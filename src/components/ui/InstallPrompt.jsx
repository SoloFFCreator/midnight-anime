import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault()
      setInstallEvent(event)
      setVisible(true)
    }
    const onInstalled = () => {
      setInstallEvent(null)
      setVisible(false)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!visible || !installEvent) return null

  const install = async () => {
    await installEvent.prompt()
    const result = await installEvent.userChoice
    if (result?.outcome !== 'accepted') setVisible(false)
    setInstallEvent(null)
  }

  return <div className="fixed inset-x-3 bottom-20 z-[80] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-or/30 bg-[#17121d]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:bottom-5">
    <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-xl" />
    <div className="min-w-0 flex-1"><p className="text-sm font-bold text-white">Install Midnight Anime</p><p className="mt-0.5 text-[11px] text-white/55">Add the app to your home screen for a faster launch.</p></div>
    <button onClick={install} className="rounded-full bg-or px-3.5 py-2 text-xs font-bold text-white">Install</button>
    <button onClick={() => { setVisible(false); setInstallEvent(null) }} aria-label="Dismiss install prompt" className="px-1 text-lg leading-none text-white/45 hover:text-white">×</button>
  </div>
}
