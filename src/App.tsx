import { useEffect, useRef, useState, lazy, Suspense } from "react";
import "./index.css";
import { supabase } from "./lib/supabase";
import Login from "./components/Accueil/Login";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";

import { CharacterSheet, CharacterSheetHandle } from "./components/Personnage/Fiche/CharacterSheet";
import { CharacterSelection } from "./components/Accueil/CharacterSelection";
import { ConfirmModal } from "./components/Shared/ConfirmModal";
import { UserProfile } from "./types";

import { AdminPanel } from "./components/Admin/AdminPanel";
import { RefProvider } from "./context/RefContext";

import { ThemeProvider } from "./context/ThemeContext";
import { ThemeSelector } from "./components/Shared/ThemeSelector";
import { ErrorBoundary } from "./components/Shared/ErrorBoundary";
import { DatabaseUpdate, DatabaseUpdateHandle } from "./components/Shared/DatabaseUpdate";
import { InfoModal } from "./components/Shared/InfoModal";

import { getVersion } from "@tauri-apps/api/app";
import { UpdateModal } from "./components/Shared/UpdateModal";
import { TitleBar } from "./components/Shared/TitleBar";

import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

import { useZoom } from "./hooks/useZoom";
import { useAppUpdater } from "./hooks/useAppUpdater";
import { useVisibleTabs } from "./hooks/useVisibleTabs";
const IndexWindow = lazy(() => import("./components/Index/IndexWindow").then(m => ({ default: m.IndexWindow })));

async function openIndexWindow() {
  try {
    const existing = WebviewWindow.getByLabel('index');
    if (existing) { await existing.show(); await existing.unminimize(); return; }
  } catch {}
  const w = new WebviewWindow('index', {
    url: 'http://localhost:1420/?view=index',
    title: 'Codex Debilium — Index',
    width: 1000,
    height: 700,
    decorations: false,
  });
  w.once('tauri://error', (e) => console.error('Index window error:', e));
}

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [view, setView] = useState<'selection' | 'sheet' | 'admin'>('selection');
  const [isDirty, setIsDirty] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const { zoomLevel, handleZoomIn, handleZoomOut, handleZoomReset } = useZoom();
  const { visibleTabs, handleToggleTab, tabsList } = useVisibleTabs(selectedCharacterId);
  const { updateStatus, updateInfo, updateError, checkForUpdates, handleInstallUpdate, closeUpdateModal } = useAppUpdater();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [appVersion, setAppVersion] = useState("0.0.0");
  const [dbVersions, setDbVersions] = useState({ local: "?", remote: "?" });

  const dbUpdateRef = useRef<DatabaseUpdateHandle>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [view, selectedCharacterId]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const sheetRef = useRef<CharacterSheetHandle>(null);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setUserProfile(data as UserProfile);
      } else if (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (selectedCharacterId) {
      setView('sheet');
    } else if (view !== 'admin') {
      setView('selection');
    }
  }, [selectedCharacterId]);

  const runWithCheck = (action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action);
      setShowConfirm(true);
    } else {
      action();
    }
  };

  const handleLogout = async () => {
    runWithCheck(async () => {
      await supabase.auth.signOut();
      setSelectedCharacterId(null);
      setView('selection');
      setIsDirty(false);
    });
  };

  const handleChangeCharacter = () => {
    runWithCheck(() => {
      setSelectedCharacterId(null);
      setView('selection');
      setIsDirty(false);
    });
  };

  const handleAdminView = () => {
    runWithCheck(() => {
      setSelectedCharacterId(null);
      setView('admin');
      setIsDirty(false);
    });
  };

  let content;
  if (view === 'admin') {
    content = <AdminPanel onBack={handleChangeCharacter} />;
  } else if (selectedCharacterId) {
    content = (
      <ErrorBoundary>
        <CharacterSheet
          ref={sheetRef}
          characterId={selectedCharacterId}
          onDirtyChange={setIsDirty}
          visibleTabs={visibleTabs}
        />
      </ErrorBoundary>
    );
  } else {
    content = (
      <CharacterSelection
        onSelect={(id) => { setSelectedCharacterId(id); }}
        isAuthenticated={!!session}
      />
    );
  }

  useEffect(() => {
    getVersion().then(v => setAppVersion(v));
  }, []);

  const handleGlobalUpdateCheck = async () => {
    await checkForUpdates(true);
    if (dbUpdateRef.current) {
      await dbUpdateRef.current.checkForUpdates(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-parchment text-leather font-sans overflow-hidden overscroll-none relative pt-8">
      <TitleBar
        onCheckUpdate={handleGlobalUpdateCheck}
        onOpenInfo={() => setShowInfoModal(true)}
        onOpenIndex={openIndexWindow}
        showActionsMenu={view === 'sheet' && !!selectedCharacterId}
        onSave={() => sheetRef.current?.save()}
        onUndo={() => sheetRef.current?.undo()}
        onRedo={() => sheetRef.current?.redo()}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        visibleTabs={visibleTabs}
        onToggleTab={handleToggleTab}
        tabsList={tabsList}
      />

      <header className="p-4 bg-leather text-parchment shadow-md flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Codex debilium</h1>
          {userProfile && (
            <span className="px-2 py-1 bg-parchment text-leather text-xs font-bold rounded uppercase border border-leather/50">
              {userProfile.role}
            </span>
          )}
        </div>

        <button
          className="md:hidden p-2 text-parchment hover:bg-white/10 rounded"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        <div className={`
          ${isMenuOpen ? 'flex' : 'hidden'}
          md:flex flex-col md:flex-row
          absolute md:static top-full left-0 w-full md:w-auto
          bg-leather md:bg-transparent
          p-4 md:p-0
          gap-4 items-stretch md:items-center
          shadow-lg md:shadow-none
          z-50
        `}>
          <div id="header-actions" className="flex justify-center md:justify-start"></div>

          <div className="flex justify-center md:justify-start">
            <ThemeSelector />
          </div>

          {session && userProfile?.role === 'admin' && view !== 'admin' && (
            <button
              onClick={handleAdminView}
              className="px-3 py-1 bg-[#cca43b] text-leather-dark font-bold rounded text-sm hover:bg-[#eebb44] cursor-pointer text-center"
            >
              Base de Données (Admin)
            </button>
          )}

          {view === 'sheet' && (
            <button
              onClick={handleChangeCharacter}
              className="px-3 py-1 bg-parchment text-leather rounded text-sm hover:bg-white cursor-pointer"
            >
              Changer de personnage
            </button>
          )}

          {view === 'admin' && (
            <button
              onClick={handleChangeCharacter}
              className="px-3 py-1 bg-parchment text-leather rounded text-sm hover:bg-white cursor-pointer"
            >
              Retour Accueil
            </button>
          )}

          {session ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-parchment text-leather rounded text-sm hover:bg-white cursor-pointer"
            >
              Déconnexion
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-3 py-1 bg-parchment text-leather rounded text-sm hover:bg-white cursor-pointer font-bold"
            >
              Connexion
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 overflow-y-scroll bg-parchment-pattern" style={{ zoom: zoomLevel }}>
        {content}
      </main>

      {isLoginOpen && !session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Login onClose={() => setIsLoginOpen(false)} />
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Modifications non sauvegardées"
        message="Vous avez des modifications non enregistrées. Que voulez-vous faire ?"
        onSaveAndContinue={async () => {
          if (sheetRef.current) {
            await sheetRef.current.save();
            pendingAction?.();
            setShowConfirm(false);
          }
        }}
        onConfirm={() => {
          pendingAction?.();
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="Quitter sans sauvegarder"
        saveLabel="Sauvegarder et Quitter"
      />

      <UpdateModal
        status={updateStatus}
        updateInfo={updateInfo}
        errorMsg={updateError}
        onClose={closeUpdateModal}
        onInstall={handleInstallUpdate}
      />

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        appVersion={appVersion}
        dbVersionLocal={dbVersions.local}
        dbVersionRemote={dbVersions.remote}
      />

      <DatabaseUpdate
        ref={dbUpdateRef}
        onVersionDetected={(local, remote) => setDbVersions({ local, remote })}
      />
    </div>
  );
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const isIndex = params.get('view') === 'index';

  return (
    <ThemeProvider>
      <RefProvider>
        {isIndex ? <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}><IndexWindow /></Suspense> : <AppContent />}
      </RefProvider>
    </ThemeProvider>
  );
}

export default App;
