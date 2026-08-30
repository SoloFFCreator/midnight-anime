import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { colors, radius } from '../theme/theme'

/** Smooth loading skeleton — per PRD's "smooth loading states and skeleton screens" requirement. */
export function SkeletonBox({ width, height, style, borderRadius = radius.md }) {
  const opacity = useRef(new Animated.Value(0.35)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  return <Animated.View style={[{ width, height, borderRadius, backgroundColor: colors.bg3, opacity }, style]} />
}

export function HomeSkeleton() {
  return (
    <View style={{ paddingTop: 0 }}>
      <SkeletonBox width="100%" height={420} borderRadius={0} />
      <View style={{ flexDirection: 'row', gap: 10, padding: 16 }}>
        {[1, 2, 3].map((i) => <SkeletonBox key={i} width={110} height={165} />)}
      </View>
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16 }}>
        {[1, 2, 3].map((i) => <SkeletonBox key={i} width={110} height={165} />)}
      </View>
    </View>
  )
}
