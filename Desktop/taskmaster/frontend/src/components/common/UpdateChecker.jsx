import { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import UpdateDialog from './UpdateDialog';
import { checkForUpdate, shouldShowUpdatePopup, clearDismissedUpdate } from '../../services/updateService';

export default function UpdateChecker() {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const lastCheckTime = useRef(0);
  const CHECK_COOLDOWN = 60000; // 1 minute cooldown between checks

  const checkUpdate = async (force = false) => {
    try {
      const now = Date.now();
      // Don't check too frequently (unless forced on app start)
      if (!force && (now - lastCheckTime.current) < CHECK_COOLDOWN) {
        return;
      }
      lastCheckTime.current = now;

      const updateInfo = await checkForUpdate();
      
      if (updateInfo.updateAvailable) {
        const shouldShow = await shouldShowUpdatePopup(updateInfo.latestVersion);
        
        if (shouldShow && !showUpdateDialog) {
          setLatestVersion(updateInfo.latestVersion);
          setCurrentVersion(updateInfo.currentVersion);
          setShowUpdateDialog(true);
        }
      } else {
        // User is on latest version, clear any dismissed flags and hide dialog
        await clearDismissedUpdate();
        setShowUpdateDialog(false);
      }
    } catch (error) {
      console.error('Error in update check:', error);
    }
  };

  useEffect(() => {
    // Check for updates when component mounts (force check on app start)
    checkUpdate(true);

    // Also check when app comes to foreground (with cooldown)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkUpdate(false);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleClose = () => {
    // User dismissed temporarily - it will show again when app comes to foreground
    // We don't mark it as permanently dismissed to encourage updates
    setShowUpdateDialog(false);
  };

  return (
    <UpdateDialog
      visible={showUpdateDialog}
      onClose={handleClose}
      latestVersion={latestVersion}
      currentVersion={currentVersion}
    />
  );
}

