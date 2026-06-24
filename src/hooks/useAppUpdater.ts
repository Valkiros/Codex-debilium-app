import { useState, useEffect, useCallback } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { UpdateStatus } from '../components/Shared/UpdateModal';

export function useAppUpdater() {
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
    const [updateInfo, setUpdateInfo] = useState<Update | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const checkForUpdates = useCallback(async (manual = false) => {
        if (manual) {
            setUpdateStatus('checking');
        }

        try {
            const update = await check();

            if (update && update.available) {
                setUpdateInfo(update);
                setUpdateStatus('available');
            } else if (manual) {
                setUpdateStatus('uptodate');
            }
        } catch (error: any) {
            console.error("Failed to check for updates:", error);
            if (manual) {
                setUpdateError(String(error));
                setUpdateStatus('error');
            }
        }
    }, []);

    const handleInstallUpdate = useCallback(async () => {
        if (!updateInfo) return;
        try {
            setUpdateStatus('downloading');
            await updateInfo.downloadAndInstall();
            await relaunch();
        } catch (e) {
            console.error("Install failed", e);
            setUpdateError("Échec de l'installation : " + String(e));
            setUpdateStatus('error');
        }
    }, [updateInfo]);

    const closeUpdateModal = useCallback(() => {
        setUpdateStatus('idle');
        setUpdateError(null);
    }, []);

    useEffect(() => {
        checkForUpdates(false);
    }, [checkForUpdates]);

    return {
        updateStatus,
        updateInfo,
        updateError,
        checkForUpdates,
        handleInstallUpdate,
        closeUpdateModal
    };
}
