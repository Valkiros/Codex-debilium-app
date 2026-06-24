import { invoke } from '@tauri-apps/api/core';

export function DocumentsPage() {
    const handleOpenFolder = async () => {
        try {
            await invoke('open_docs_folder');
        } catch (err) {
            console.error('Impossible d\'ouvrir le dossier docs:', err);
        }
    };

    return (
        <div className="space-y-6 font-serif">
            <h1 className="text-2xl font-bold text-leather">Documents & PDFs</h1>
            <p className="text-ink-light text-sm">
                Consultez vos documents de référence directement depuis l'application.
            </p>

            <div className="bg-parchment/60 border border-leather/20 rounded-lg px-6 py-8 flex flex-col items-center text-center space-y-4">
                <div className="text-leather/40 text-5xl select-none">&#128218;</div>
                <p className="text-ink text-sm max-w-md">
                    Placez vos fichiers PDF dans le dossier <code className="bg-leather/10 px-1.5 py-0.5 rounded text-xs text-leather font-mono">data/docs/</code> pour
                    les retrouver ici.
                </p>
                <button
                    onClick={handleOpenFolder}
                    className="mt-2 px-5 py-2 bg-leather text-parchment rounded font-serif text-sm hover:bg-leather-dark transition-colors"
                >
                    Ouvrir le dossier
                </button>
            </div>

            <div className="text-xs text-ink-light italic">
                Les fichiers PDF ajoutés dans le dossier apparaitront automatiquement dans cette section.
            </div>
        </div>
    );
}
