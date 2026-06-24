import { useState } from 'react';
import { GameRules, Origine } from '../../../types';

interface OriginesPageProps {
    gameRules: GameRules | null;
}

const STAT_LABELS: Record<string, string> = {
    COU: 'COU', INT: 'INT', CHA: 'CHA', AD: 'AD', FO: 'FO',
};

function formatMinMax(min: Record<string, number | undefined>, max: Record<string, number | undefined>): string {
    const parts: string[] = [];
    for (const [key, label] of Object.entries(STAT_LABELS)) {
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

function InfoRow({ label, value }: { label: string; value: any }) {
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
    const display = Array.isArray(value) ? value.join(', ') : String(value);
    return (
        <div className="text-xs">
            <span className="text-leather font-medium">{label} : </span>
            {display}
        </div>
    );
}

function SensRow({ sens }: { sens: any }) {
    if (!sens) return null;
    const parts = Object.entries(sens)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `${k}: ${v}`);
    if (parts.length === 0) return null;
    return <InfoRow label="Sens" value={parts.join(', ')} />;
}

function BonusRow({ label, bonus }: { label: string; bonus: any }) {
    if (!bonus) return null;
    if (Array.isArray(bonus)) {
        if (bonus.length === 0) return null;
        return (
            <div className="text-xs">
                <span className="text-leather font-medium">{label} : </span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-ink-light">
                    {bonus.map((b: any, i: number) => (
                        <li key={i}>{typeof b === 'string' ? b : JSON.stringify(b)}</li>
                    ))}
                </ul>
            </div>
        );
    }
    if (typeof bonus === 'object') {
        const entries = Object.entries(bonus);
        if (entries.length === 0) return null;
        return <InfoRow label={label} value={entries.map(([k, v]) => `${k} ${v}`).join(', ')} />;
    }
    return <InfoRow label={label} value={bonus} />;
}

function OrigineCard({ origine, corruptionEffects }: { origine: any; corruptionEffects?: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const min = (origine.Min || origine.min || {}) as Record<string, number | undefined>;
    const max = (origine.Max || origine.max || {}) as Record<string, number | undefined>;
    const summary = formatMinMax(min, max);
    const name_m = origine.Name_M || origine.name_m;
    const name_f = origine.Name_F || origine.name_f;

    return (
        <div className="border border-leather/20 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left px-5 py-3 bg-leather/10 hover:bg-leather/15 transition-colors flex items-center gap-3"
            >
                <span className="text-leather text-sm select-none">{isExpanded ? '▼' : '▶'}</span>
                <div className="flex-1">
                    <span className="font-serif font-bold text-leather">{name_m}</span>
                    {name_f && name_f !== name_m && (
                        <span className="text-ink-light font-serif text-sm ml-2">/ {name_f}</span>
                    )}
                    {origine.Tags && origine.Tags.length > 0 && (
                        <span className="ml-2 text-xs text-ink-light italic">({origine.Tags.join(', ')})</span>
                    )}
                </div>
                <span className="text-xs text-ink-light font-serif">{summary}</span>
            </button>

            {isExpanded && (
                <div className="px-5 py-3 space-y-2 text-sm font-serif text-ink">
                    <InfoRow label="Min/Max" value={summary} />

                    {/* Combat */}
                    <div className="text-xs flex gap-4 flex-wrap">
                        {origine.AT != null && <span><span className="text-leather font-medium">AT :</span> {origine.AT}</span>}
                        {origine.PRD != null && <span><span className="text-leather font-medium">PRD :</span> {origine.PRD}</span>}
                        {origine.Vitesse != null && <span><span className="text-leather font-medium">Vitesse :</span> {origine.Vitesse}</span>}
                        {origine.Taille != null && <span><span className="text-leather font-medium">Taille :</span> {origine.Taille}</span>}
                    </div>

                    {/* EV / EA */}
                    <div className="text-xs flex gap-4 flex-wrap">
                        {origine.EV_initiale != null && <span><span className="text-leather font-medium">EV initiale :</span> {origine.EV_initiale}</span>}
                        {origine.EV_par_niveau != null && <span><span className="text-leather font-medium">EV/niveau :</span> {origine.EV_par_niveau}</span>}
                        {origine.EA_initiale != null && <span><span className="text-leather font-medium">EA initiale :</span> {origine.EA_initiale}</span>}
                        {origine.EA_par_niveau != null && <span><span className="text-leather font-medium">EA/niveau :</span> {origine.EA_par_niveau}</span>}
                    </div>

                    <InfoRow label="PR Sol. max" value={origine.PR_sol_max} />
                    <InfoRow label="Transport max" value={origine.Transport_max} />
                    <InfoRow label="Langues" value={origine.Langues} />
                    <SensRow sens={origine.Sens} />
                    <InfoRow label="Race" value={origine.Race_tags} />

                    {/* Bonus */}
                    <BonusRow label="Bonus d'origine" bonus={origine.Bonus_origine} />
                    <BonusRow label="Bonus conditionnel" bonus={origine.Bonus_origine_conditionnel} />

                    {/* Compétences */}
                    <InfoRow label="Compétences innées" value={origine.Competences_innees} />
                    {origine.Competences_choix_creation_note && (
                        <InfoRow label="Compétences au choix (création)" value={origine.Competences_choix_creation_note} />
                    )}
                    {origine.Competences_developpables_note && (
                        <InfoRow label="Compétences développables" value={origine.Competences_developpables_note} />
                    )}

                    {/* Matériel & Restrictions */}
                    <InfoRow label="Matériel" value={origine.Materiel} />
                    <InfoRow label="Restrictions équipement" value={origine.Restrictions_equipement} />
                    <InfoRow label="Métiers interdits" value={origine.Metiers_impossibles || origine.metiers_impossibles} />
                    <InfoRow label="Métiers exclusifs" value={origine.Metiers_exclusifs} />
                    <InfoRow label="Notes spéciales" value={origine.Notes_speciales} />

                    {/* Corruption */}
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
                Cliquez sur une origine pour afficher ses détails complets.
            </p>

            <div className="space-y-3">
                {gameRules.origines.map((origine: any) => (
                    <OrigineCard
                        key={origine.ID || origine.id}
                        origine={origine}
                        corruptionEffects={corruptionByName.get(origine.Name_M || origine.name_m) || corruptionByName.get(origine.Name_F || origine.name_f)}
                    />
                ))}
            </div>
        </div>
    );
}
