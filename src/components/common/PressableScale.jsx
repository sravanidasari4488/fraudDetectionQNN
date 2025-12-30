import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

export default function PressableScale({ children, style, onPress, disabled, rippleColor = 'rgba(0,0,0,0.08)', activeScale = 0.97, activeOpacity = 0.92, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: activeScale, useNativeDriver: true, speed: 20, bounciness: 0 }),
      Animated.timing(opacity, { toValue: activeOpacity, duration: 120, useNativeDriver: true })
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      android_ripple={{ color: rippleColor }}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // no local styles required; styles are passed via `style` prop
});
