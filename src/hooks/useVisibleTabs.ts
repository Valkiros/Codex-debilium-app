import { useState, useEffect, useCallback } from 'react';

const TABS_LIST = [
    { id: 'fiche', label: 'Fiche' },
    { id: 'equipement', label: 'Équipements' },
    { id: 'sacoches', label: 'Sacoches & Poches' },
    { id: 'sac', label: 'Sac' },
    { id: 'catalogue', label: 'Catalogue' },
    { id: 'status', label: 'État' },
    { id: 'competences', label: 'Compétences' },
    { id: 'ape', label: 'APE' },
    { id: 'richesse', label: 'Richesse' },
    { id: 'monture', label: 'Montures' },
    { id: 'familiers', label: 'Familiers' },
    { id: 'invocations', label: 'Invocations' },
];

export function useVisibleTabs(selectedCharacterId: string | null) {
    const [visibleTabs, setVisibleTabs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (selectedCharacterId) {
            const savedTabs = localStorage.getItem(`app_visible_tabs_${selectedCharacterId}`);
            if (savedTabs) {
                setVisibleTabs(JSON.parse(savedTabs));
            } else {
                setVisibleTabs({});
            }
        } else {
            setVisibleTabs({});
        }
    }, [selectedCharacterId]);

    useEffect(() => {
        if (selectedCharacterId) {
            localStorage.setItem(`app_visible_tabs_${selectedCharacterId}`, JSON.stringify(visibleTabs));
        }
    }, [visibleTabs, selectedCharacterId]);

    const handleToggleTab = useCallback((tabId: string) => {
        setVisibleTabs(prev => ({
            ...prev,
            [tabId]: prev[tabId] === false ? true : false
        }));
    }, []);

    return { visibleTabs, handleToggleTab, tabsList: TABS_LIST };
}
