import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Competence {
    nom: string;
    description: string;
    tableau: string | null;
}

interface CompetencesPageProps {
    initialFilter?: string;
    onFilterUsed?: () => void;
}

export function CompetencesPage({ initialFilter, onFilterUsed }: CompetencesPageProps) {
    const [competences, setCompetences] = useState<Competence[]>([]);
    const [search, setSearch] = useState(initialFilter || '');
    const [loading, setLoading] = useState(true);
    const highlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        invoke<Competence[]>('get_competences')
            .then(setCompetences)
            .catch(err => console.error('Failed to load competences:', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (initialFilter) {
            setSearch(initialFilter);
            onFilterUsed?.();
            setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
    }, [initialFilter]);

    competences.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

    if (loading) {
        return <div className="text-leather font-serif italic">Chargement des compétences...</div>;
    }

    const filtered = search
        ? competences.filter(c =>
            c.nom.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase())
        )
        : competences;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif font-bold text-leather">Compétences</h1>
            <p className="text-ink-light font-serif text-sm">
                Liste complète des compétences disponibles ({competences.length} compétences).
            </p>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une compétence..."
                className="w-full max-w-md px-4 py-2 bg-input-bg border border-leather/30 rounded text-ink font-serif text-sm focus:border-leather outline-none"
            />

            <div className="grid grid-cols-1 gap-3">
                {filtered.map((comp, i) => {
                    const isHighlighted = initialFilter && comp.nom.toLowerCase() === initialFilter.toLowerCase();
                    return (
                        <div
                            key={comp.nom}
                            ref={isHighlighted ? highlightRef : undefined}
                            className={`bg-parchment/60 border rounded px-4 py-3 ${isHighlighted ? 'border-leather ring-2 ring-leather/30' : 'border-leather/20'}`}
                        >
                            <div className="font-bold text-leather text-sm font-serif">{comp.nom}</div>
                            <div className="text-ink text-sm mt-1">{comp.description}</div>
                            {comp.tableau && comp.tableau.length > 0 && (
                                <div className="text-ink-light text-xs mt-1 italic">Tableau : {comp.tableau}</div>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-ink-light font-serif italic text-sm">Aucune compétence trouvée.</div>
                )}
            </div>
        </div>
    );
}
