import Constants from 'expo-constants';
import supabase from '../data/supabaseClient';

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
    const { data, error } = await supabase
      .schema('onlyclick')
      .from('general_data')
      .select('value')
      .eq('key', 'latest_app_version')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No version set in database, assume app is up to date
        return { needsUpdate: false, latestVersion: CURRENT_VERSION };
      }
      throw error;
    }

    const latestVersion = data?.value || CURRENT_VERSION;
    const needsUpdate = compareVersions(CURRENT_VERSION, latestVersion) < 0;

    return {
      needsUpdate,
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

