import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  View
} from 'react-native';
import PressableScale from './PressableScale';
import Text from "../ui/Text";

import { useState } from 'react';

export default function AppHeader({
  title = '',
  showBack = false,
  onBack = () => {},
  variant = 'solid', // 'solid' | 'transparent'
  accentColor = '#3898B3',
  backgroundColor,
  textColor = '#ffffff',
  hideStatusBar = true,
  rightElement = null, // optional node rendered on the right
}) {
  const headerBg = backgroundColor || (variant === 'transparent' ? 'transparent' : accentColor);
  const topInset = hideStatusBar ? 8 : (Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 44);
  const hasRight = !!rightElement;
  const [backLoading, setBackLoading] = useState(false);

  const handleBack = async () => {
    if (backLoading) return;
    setBackLoading(true);
    await Promise.resolve(onBack());
    setTimeout(() => setBackLoading(false), 1000); // Prevent double click for 1s
  };

  return (
    <View style={[styles.header, { backgroundColor: headerBg, paddingTop: topInset + 8 }]}> 
      <StatusBar hidden={hideStatusBar} style={variant === 'transparent' ? 'dark' : 'light'} />

      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          {showBack ? (
            <PressableScale
              accessibilityLabel="Go back"
              accessibilityRole="button"
              style={[styles.iconButton, backLoading && { opacity: 0.6 }]}
              onPress={handleBack}
              disabled={backLoading}
            >
              <Ionicons name="arrow-back" size={22} color={textColor} />
            </PressableScale>
          ) : (
            <View style={styles.placeholder} />
          )}

          <View style={[styles.titleWrap, hasRight ? null : { marginRight: 0 }] }>
            <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>

          {hasRight ? (
            <View style={styles.rightSlot}>
              {rightElement}
            </View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </View>
  );
}

function lighten(hex, amount = 0.7) {
  // simple hex to rgba lightening helper for text contrast
  try {
    if (!hex) return '#fff';
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    const r = Math.min(255, Math.floor(((num >> 16) & 255) * amount + 255 * (1 - amount)));
    const g = Math.min(255, Math.floor(((num >> 8) & 255) * amount + 255 * (1 - amount)));
    const b = Math.min(255, Math.floor((num & 255) * amount + 255 * (1 - amount)));
    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    return '#fff';
  }
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 0,
    paddingBottom: 8,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerTop: {
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  placeholder: {
    width: 36,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.95,
  },
  rightSlot: {
    minWidth: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'android' ? 18 : 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    backgroundColor: '#ff4d4f',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  profileButton: {
    marginLeft: 8,
  },
  profileImage: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  profilePlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 10,
    opacity: 0.85,
  },
  ratingWrap: {
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
