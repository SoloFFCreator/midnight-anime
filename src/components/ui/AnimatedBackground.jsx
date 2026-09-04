import { motion } from 'framer-motion'

/**
 * Ambient "midnight" background — soft animated gradient blooms that
 * drift slowly behind page content. Pure CSS gradients + Framer Motion,
 * no external images, so it's copyright-safe and lightweight.
 */
export default function AnimatedBackground({ variant = 'default' }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-bg">
      <motion.div
        className="absolute w-[560px] h-[560px] rounded-full bg-or/20 blur-[120px]"
        style={{ top: '-10%', left: '15%' }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, 40, 80, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full bg-purple-600/10 blur-[100px]"
        style={{ top: '40%', right: '5%' }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute w-[380px] h-[380px] rounded-full bg-or2/10 blur-[110px]"
        style={{ bottom: '5%', left: '35%' }}
        animate={{
          x: [0, 40, -60, 0],
          y: [0, -50, 20, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {variant === 'hero' && (
        <>
          <motion.div
            className="absolute hidden lg:block top-32 left-[8%] w-24 h-32 rounded-2xl bg-gradient-to-br from-bg3 to-bg2 border border-white/10"
            initial={{ opacity: 0, rotate: -8 }}
            animate={{ opacity: 1, y: [0, -18, 0], rotate: [-8, -6, -8] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute hidden lg:block top-56 right-[10%] w-28 h-36 rounded-2xl bg-gradient-to-br from-or/20 to-bg2 border border-or/20"
            initial={{ opacity: 0, rotate: 7 }}
            animate={{ opacity: 1, y: [0, -18, 0], rotate: [7, 9, 7] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />
        </>
      )}

      {/* Subtle noise-like grain via repeating gradient, keeps flat blur from looking too clean */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}
