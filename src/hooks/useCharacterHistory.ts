import React, { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { CharacterData } from '../types';
import { INITIAL_DATA } from '../constants';

interface UseCharacterHistoryOptions {
    onDirtyChange?: (isDirty: boolean) => void;
}

interface UseCharacterHistoryReturn {
    data: CharacterData;
    setData: (newData: CharacterData | ((prev: CharacterData) => CharacterData)) => void;
    undo: () => void;
    redo: () => void;
    saveCharacter: () => Promise<void>;
    initFromLoaded: (loadedData: CharacterData) => void;
    isInitialLoad: React.MutableRefObject<boolean>;
    showSaveToast: boolean;
    characterId: string;
}

export function useCharacterHistory(
    characterId: string,
    { onDirtyChange }: UseCharacterHistoryOptions
): UseCharacterHistoryReturn {
    const [data, setDataState] = useState<CharacterData>(INITIAL_DATA);
    const [showSaveToast, setShowSaveToast] = useState(false);

    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const isUndoingRef = useRef(false);
    const isInitialLoad = useRef(true);

    const pushToHistory = useCallback((newData: CharacterData) => {
        if (isUndoingRef.current || isInitialLoad.current) return;
        const serialized = JSON.stringify(newData);

        if (historyIndexRef.current >= 0 && historyRef.current[historyIndexRef.current] === serialized) return;

        const currentIdx = historyIndexRef.current;
        const newHistory = historyRef.current.slice(0, currentIdx + 1);
        newHistory.push(serialized);

        if (newHistory.length > 50) newHistory.shift();

        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
    }, []);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            isUndoingRef.current = true;
            historyIndexRef.current -= 1;
            const prevState = JSON.parse(historyRef.current[historyIndexRef.current]);
            setDataState(prevState);
            onDirtyChange?.(true);
            setTimeout(() => { isUndoingRef.current = false; }, 50);
        }
    }, [onDirtyChange]);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            isUndoingRef.current = true;
            historyIndexRef.current += 1;
            const nextState = JSON.parse(historyRef.current[historyIndexRef.current]);
            setDataState(nextState);
            onDirtyChange?.(true);
            setTimeout(() => { isUndoingRef.current = false; }, 50);
        }
    }, [onDirtyChange]);

    const setData = useCallback((newData: CharacterData | ((prev: CharacterData) => CharacterData)) => {
        if (typeof newData === 'function') {
            setDataState(prev => {
                const updated = newData(prev);
                pushToHistory(updated);
                return updated;
            });
        } else {
            setDataState(newData);
            pushToHistory(newData);
        }
        if (!isInitialLoad.current) {
            onDirtyChange?.(true);
        }
    }, [pushToHistory, onDirtyChange]);

    const saveCharacter = useCallback(async () => {
        try {
            await invoke('save_personnage_local', {
                id: characterId,
                name: data.identity.nom || 'Sans nom',
                data: JSON.stringify(data),
                updatedAt: new Date().toISOString()
            });
            onDirtyChange?.(false);
            setShowSaveToast(true);
            setTimeout(() => { setShowSaveToast(false); }, 3000);
        } catch (err) {
            console.error("Save failed", err);
            throw err;
        }
    }, [characterId, data, onDirtyChange]);

    const initFromLoaded = useCallback((loadedData: CharacterData) => {
        setDataState(loadedData);
        historyRef.current = [JSON.stringify(loadedData)];
        historyIndexRef.current = 0;
    }, []);

    // Keyboard shortcuts
    const saveRef = useRef(saveCharacter);
    const undoRef = useRef(undo);
    const redoRef = useRef(redo);

    useEffect(() => {
        saveRef.current = saveCharacter;
        undoRef.current = undo;
        redoRef.current = redo;
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 's') {
                    e.preventDefault();
                    saveRef.current();
                } else if (e.key.toLowerCase() === 'z') {
                    const tag = document.activeElement?.tagName.toLowerCase();
                    if (tag === 'input' || tag === 'textarea') return;
                    e.preventDefault();
                    if (e.shiftKey) {
                        redoRef.current();
                    } else {
                        undoRef.current();
                    }
                } else if (e.key.toLowerCase() === 'y') {
                    const tag = document.activeElement?.tagName.toLowerCase();
                    if (tag === 'input' || tag === 'textarea') return;
                    e.preventDefault();
                    redoRef.current();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        data,
        setData,
        undo,
        redo,
        saveCharacter,
        initFromLoaded,
        isInitialLoad,
        showSaveToast,
        characterId,
    };
}
