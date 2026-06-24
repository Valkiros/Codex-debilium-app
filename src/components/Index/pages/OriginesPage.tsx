import { useState } from 'react';
import { GameRules, Origine } from '../../../types';

interface OriginesPageProps {
    gameRules: GameRules | null;
}

const STAT_LABELS: Record<string, string> = {
    COUR: 'COU',
    COU: 'COU',
    INT: 'INT',
    CHA: 'CHA',
    AD: 'AD',
    FO: 'FO',
};

function formatMinMax(min: Record<string, number | undefined>, max: Record<string, number | undefined>): string {
    const parts: string[] = [];
    for (const [key, label] of Object.entries(STAT_LABELS)) {
        if (key === 'COUR') continue;
        const minVal = min[key] ?? min[key === 'COU' ? 'COUR' : key];
        const maxVal = max[key] ?? max[key === 'COU' ? 'COUR' : key];
        if (minVal != null || maxVal != null) {
            const minStr = minVal != null ? String(minVal) : '-';
            const maxStr = maxVal != null ? String(maxVal) : '-';
            parts.push(`${label} ${minStr}/${maxStr}`);
        }
    }
    return parts.length > 0 ? parts.join(', ') : '-';
}

function OrigineCard({ origine, corruptionEffects }: { origine: Origine; corruptionEffects?: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const min = (origine.min || {}) as Record<string, number | undefined>;
    const max = (origine.max || {}) as Record<string, number | undefined>;
    const summary = formatMinMax(min, max);

    return (
        <div className="border border-leather/20 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left px-5 py-3 bg-leather/10 hover:bg-leather/15 transition-colors flex items-center gap-3"
            >
                <span className="text-leather text-sm select-none">{isExpanded ? '▼' : '▶'}</span>
                <div className="flex-1">
                    <span className="font-serif font-bold text-leather">
                        {origine.name_m}
                    </span>
                    {origine.name_f && origine.name_f !== origine.name_m && (
                        <span className="text-ink-light font-serif text-sm ml-2">/ {origine.name_f}</span>
                    )}
                </div>
                <span className="text-xs text-ink-light font-serif">
                    {summary}
                </span>
            </button>

            {isExpanded && (
                <div className="px-5 py-3 space-y-2 text-sm font-serif text-ink">
                    <div className="text-xs">
                        <span className="text-leather font-medium">Min/Max : </span>
                        {summary}
                    </div>

                    <div className="text-xs">
                        <span className="text-leather font-medium">Vitesse : </span>
                        {origine.vitesse}
                    </div>

                    {origine.metiers_impossibles && origine.metiers_impossibles.length > 0 && (
                        <div className="text-xs">
                            <span className="text-leather font-medium">Métiers interdits : </span>
                            {origine.metiers_impossibles.join(', ')}
                        </div>
                    )}

                    {origine.competences && origine.competences.length > 0 && (
                        <div className="text-xs">
                            <span className="text-leather font-medium">Compétences : </span>
                            {origine.competences.join(', ')}
                        </div>
                    )}

                    {corruptionEffects && corruptionEffects !== 'Aucun effet' && corruptionEffects !== 'Pas d\'effet' && (
                        <div className="text-xs mt-1 border-t border-leather/10 pt-2">
                            <span className="text-leather font-medium">Corruption : </span>
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-ink-light">
                                {corruptionEffects.split('|').map((effect, i) => (
                                    <li key={i}>{effect.trim()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function OriginesPage({ gameRules }: OriginesPageProps) {
    if (!gameRules) {
        return <div className="text-leather font-serif italic">Chargement des origines...</div>;
    }

    const corruptionByName = new Map<string, string>();
    if (gameRules.corruption_origine) {
        for (const entry of gameRules.corruption_origine as any[]) {
            corruptionByName.set(entry.Masculin, entry.Effets);
            if (entry.Féminin) corruptionByName.set(entry.Féminin, entry.Effets);
        }
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-serif font-bold text-leather">Origines</h1>
            <p className="text-ink-light font-serif text-sm">
                Cliquez sur une origine pour afficher ses détails, restrictions et effets de corruption.
            </p>

            <div className="space-y-3">
                {gameRules.origines.map((origine) => (
                    <OrigineCard
                        key={origine.id}
                        origine={origine}
                        corruptionEffects={corruptionByName.get(origine.name_m) || corruptionByName.get(origine.name_f)}
                    />
                ))}
            </div>
        </div>
    );
}
