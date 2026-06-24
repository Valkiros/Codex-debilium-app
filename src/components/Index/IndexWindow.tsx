import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose, VscChromeRestore } from 'react-icons/vsc';
import { useRefContext } from '../../context/RefContext';
import { ErrorBoundary } from '../Shared/ErrorBoundary';
import { IndexSidebar, IndexSection } from './IndexSidebar';
import { OriginesPage } from './pages/OriginesPage';
import { MetiersPage } from './pages/MetiersPage';
import { CompetencesPage } from './pages/CompetencesPage';
import { FormulesPage } from './pages/FormulesPage';
import { CorruptionPage } from './pages/CorruptionPage';
import { AlcoolDroguesPage } from './pages/AlcoolDroguesPage';
import { DocumentsPage } from './pages/DocumentsPage';

export function IndexWindow() {
    const [activeSection, setActiveSection] = useState<IndexSection>('origines');
    const [competenceFilter, setCompetenceFilter] = useState('');
    const [isMaximized, setIsMaximized] = useState(false);
    const { gameRules, loading } = useRefContext();

    const navigateToCompetence = (name: string) => {
        setCompetenceFilter(name);
        setActiveSection('competences');
    };

    const appWindow = getCurrentWindow();

    const handleMinimize = () => appWindow.minimize();
    const handleMaximize = async () => {
        const maximized = await appWindow.isMaximized();
        if (maximized) {
            await appWindow.unmaximize();
            setIsMaximized(false);
        } else {
            await appWindow.maximize();
            setIsMaximized(true);
        }
    };
    const handleClose = () => appWindow.close();

    useEffect(() => {
        const unlisten = appWindow.onResized(async () => {
            setIsMaximized(await appWindow.isMaximized());
        });
        return () => { unlisten.then(fn => fn()); };
    }, []);

    const renderContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center h-full text-leather font-serif italic">Chargement des données...</div>;
        }

        switch (activeSection) {
            case 'origines': return <OriginesPage gameRules={gameRules} onNavigateToCompetence={navigateToCompetence} />;
            case 'metiers': return <MetiersPage gameRules={gameRules} onNavigateToCompetence={navigateToCompetence} />;
            case 'competences': return <CompetencesPage initialFilter={competenceFilter} onFilterUsed={() => setCompetenceFilter('')} />;
            case 'formules': return <FormulesPage />;
            case 'corruption': return <CorruptionPage gameRules={gameRules} />;
            case 'alcool-drogues': return <AlcoolDroguesPage />;
            case 'documents': return <DocumentsPage />;
            default: return <OriginesPage gameRules={gameRules} />;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-parchment text-leather overflow-hidden">
            <div className="h-8 bg-[#1a1a1a] flex items-center justify-between select-none flex-shrink-0" data-tauri-drag-region>
                <div className="flex items-center h-full px-3">
                    <span className="text-[#cccccc] text-xs font-sans">Index & Règles</span>
                </div>

                <div className="text-[#cccccc] text-xs flex-1 text-center" data-tauri-drag-region>
                    Codex Debilium — Index
                </div>

                <div className="flex h-full">
                    <button onClick={handleMinimize} className="px-3 h-full hover:bg-[#333] text-[#cccccc] flex items-center">
                        <VscChromeMinimize />
                    </button>
                    <button onClick={handleMaximize} className="px-3 h-full hover:bg-[#333] text-[#cccccc] flex items-center">
                        {isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />}
                    </button>
                    <button onClick={handleClose} className="px-3 h-full hover:bg-[#c42b1c] text-[#cccccc] flex items-center">
                        <VscChromeClose />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <IndexSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="flex-1 overflow-y-auto p-6 bg-parchment-pattern">
                    <ErrorBoundary>
                        {renderContent()}
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}
