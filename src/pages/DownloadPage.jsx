import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ANDROID_PACKAGE, APK_DOWNLOAD_URL, openMidnightAnimeApp } from '../utils/openApp'

export default function DownloadPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#050507] text-[#f5f0e8] font-body px-5 sm:px-8 py-10">
      <div className="max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-10">
          <img src="/midnight-anime-logo.png" alt="Midnight Anime" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-extrabold text-[15px]">
            Midnight<span className="text-or">Anime</span>
          </span>
        </Link>

        <motion.div
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-or to-[#ff9040] flex items-center justify-center text-4xl mb-6 shadow-glow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          📲
        </motion.div>

        <h1 className="font-display font-black text-3xl text-center mb-2">Download the App</h1>
        <p className="text-white/50 text-[14px] text-center mb-8">
          Free, ad-free browsing, and a smoother player than the mobile site.
        </p>

        <motion.a
          href={APK_DOWNLOAD_URL}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2.5 w-full bg-or text-white font-bold text-[15px] py-4 rounded-2xl shadow-glow mb-4"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download APK (v5)
        </motion.a>

        <button
          type="button"
          onClick={() => openMidnightAnimeApp(navigate)}
          className="w-full rounded-2xl border border-white/[0.12] py-3 text-[13px] font-bold text-white/75 transition-colors hover:border-or/50 hover:text-white mb-3"
        >
          Try opening the installed app
        </button>

        <p className="text-white/30 text-[11px] text-center mb-10">
          Android 8.0+ required · If the app is installed, Open App launches {ANDROID_PACKAGE}; otherwise download the APK above.
        </p>

        <div className="bg-[#1c1420] border border-white/[0.07] rounded-2xl p-6">
          <p className="font-display font-bold text-[14px] mb-4">How to install</p>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-or/15 text-or text-[12px] font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-white/70 text-[13px] leading-relaxed pt-0.5">{s}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex items-start gap-2.5 text-[12px] text-white/40 bg-white/[0.03] rounded-xl p-4">
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          <p>
            Android blocks installs from outside the Play Store by default. You'll be prompted to
            allow installs from this source — that's expected for direct APK downloads, not a
            sign anything's wrong.
          </p>
        </div>
      </div>
    </div>
  )
}

const steps = [
  'Tap "Download APK" above and wait for the download to finish.',
  'Open the downloaded file from your notifications or Downloads folder.',
  'If prompted, allow "Install unknown apps" for your browser — this is a one-time Android permission.',
  'Tap Install, then open Midnight Anime once it finishes.',
]
