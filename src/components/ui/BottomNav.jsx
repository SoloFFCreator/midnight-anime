import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const tabs = [
  { to: '/app', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { to: '/search', label: 'Search', icon: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35' },
  { to: '/trending', label: 'Trending', icon: 'M23 6l-9.5 9.5-5-5L1 18' },
  { to: '/watchlist', label: 'My List', icon: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-bg/90 backdrop-blur-xl border-t border-white/[0.06] flex justify-around py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === '/app'} className="flex flex-col items-center gap-1 px-3 py-1">
          {({ isActive }) => (
            <>
              <motion.svg
                viewBox="0 0 24 24" className="w-5 h-5" fill="none"
                stroke={isActive ? '#F47521' : 'rgba(255,255,255,.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                animate={{ scale: isActive ? 1.1 : 1 }}
              >
                <path d={tab.icon} />
              </motion.svg>
              <span className={`text-[10px] font-bold ${isActive ? 'text-or' : 'text-white/40'}`}>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
