import Constants from 'expo-constants';
import supabase from '../data/supabaseClient';
import { getStoredAppVersion, setStoredAppVersion } from '../utils/storage';

const CURRENT_VERSION = Constants.expoConfig?.version || '1.0.1';
const ANDROID_PACKAGE_NAME = Constants.expoConfig?.android?.package || 'com.onlyclick.user';

export function getCurrentVersion() {
  return CURRENT_VERSION;
}

export function getAndroidPackageName() {
  return ANDROID_PACKAGE_NAME;
}

export async function checkAppUpdate() {
  try {
    // Get the stored app version (last known version we checked)
    const storedVersion = await getStoredAppVersion();
    
    // Check latest version from database
    const { data, error } = await supabase
      .schema('onlyclick')
      .from('general_data')
      .select('value')
      .eq('key', 'latest_app_version')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No version set in database, assume app is up to date
        await setStoredAppVersion(CURRENT_VERSION);
        return { needsUpdate: false, latestVersion: CURRENT_VERSION };
      }
      throw error;
    }

    const latestVersion = data?.value || CURRENT_VERSION;
    const needsUpdate = compareVersions(CURRENT_VERSION, latestVersion) < 0;

    // If current version is up to date or newer than latest, update stored version
    // This means user has updated to the latest version - don't show popup
    if (!needsUpdate) {
      await setStoredAppVersion(CURRENT_VERSION);
      return {
        needsUpdate: false,
        currentVersion: CURRENT_VERSION,
        latestVersion,
      };
    }

    // Update is needed
    // Check if stored version matches current version
    // If they match, it means we've already shown the popup for this version
    // If they don't match, it could mean:
    // 1. First time checking (storedVersion is null)
    // 2. User updated the app (CURRENT_VERSION changed, but storedVersion is old)
    // In case 2, we should check again - if CURRENT_VERSION is still < latestVersion, show popup
    // In case 1, show popup
    
    // Always update stored version to current version
    // This way, when user updates the app, CURRENT_VERSION will change
    // and on next launch, we'll detect the change
    await setStoredAppVersion(CURRENT_VERSION);

    return {
      needsUpdate: true,
      currentVersion: CURRENT_VERSION,
      latestVersion,
    };
  } catch (error) {
    console.warn('[AppVersion] Failed to check update:', error?.message || error);
    // On error, assume app is up to date to avoid blocking users
    return { needsUpdate: false, latestVersion: CURRENT_VERSION };
  }
}

function compareVersions(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (currentPart < latestPart) return -1;
    if (currentPart > latestPart) return 1;
  }

  return 0;
}

export function getPlayStoreUrl() {
  const packageName = getAndroidPackageName();
  return `https://play.google.com/store/apps/details?id=${packageName}`;
}

