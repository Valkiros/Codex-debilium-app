import { useState } from 'react';
import { GameRules, Metier, Specialisation, SousSpecialisation } from '../../../types';

interface MetiersPageProps {
    gameRules: GameRules | null;
    onNavigateToCompetence?: (name: string) => void;
}

const STAT_LABELS: Record<string, string> = {
    COUR: 'COU',
    INT: 'INT',
    CHA: 'CHA',
    AD: 'AD',
    FO: 'FO',
};

function formatMinMax(min: Record<string, number | undefined>, max: Record<string, number | undefined>): string {
    const parts: string[] = [];
    for (const [key, label] of Object.entries(STAT_LABELS)) {
        const minVal = min[key as keyof typeof min];
        const maxVal = max[key as keyof typeof max];
        if (minVal != null || maxVal != null) {
            const minStr = minVal != null ? String(minVal) : '-';
            const maxStr = maxVal != null ? String(maxVal) : '-';
            parts.push(`${label} ${minStr}/${maxStr}`);
        }
    }
    return parts.length > 0 ? parts.join(', ') : '-';
}

function formatAutoAttributes(attrs: Record<string, number>): string {
    const entries = Object.entries(attrs);
    if (entries.length === 0) return '-';
    return entries.map(([key, val]) => `${key} ${val >= 0 ? '+' : ''}${val}`).join(', ');
}

function formatSpecAttributes(attrs: Record<string, string>): string {
    const values = Object.values(attrs);
    if (values.length === 0) return '-';
    return values.join(' | ');
}

function ClickableCompList({ comps, onNavigate }: { comps: string[]; onNavigate?: (name: string) => void }) {
    return (
        <span className="inline-flex flex-wrap gap-1">
            {comps.map((name, i) => (
                <button
                    key={`${name}-${i}`}
                    onClick={() => onNavigate?.(name)}
                    className="bg-leather/10 hover:bg-leather/20 text-ink px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                    title={`Voir : ${name}`}
                >
                    {name}
                </button>
            ))}
        </span>
    );
}

/* ---- Sous-Specialisation Card ---- */
function SousSpecCard({ sousSpe, onNavigate }: { sousSpe: SousSpecialisation; onNavigate?: (name: string) => void }) {
    return (
        <div className="ml-8 mt-2 bg-parchment/60 border border-leather/20 rounded px-4 py-3">
            <div className="flex items-baseline gap-2">
                <span className="text-sm font-serif font-bold text-leather">
                    {sousSpe.name_m}
                </span>
                {sousSpe.name_f && sousSpe.name_f !== sousSpe.name_m && (
                    <span className="text-xs text-ink-light font-serif">/ {sousSpe.name_f}</span>
                )}
            </div>

            <div className="mt-2 space-y-1 text-xs font-serif text-ink">
                {sousSpe.necessite_competence.length > 0 && (
                    <div>
                        <span className="text-leather font-medium">Compétences requises : </span>
                        <ClickableCompList comps={sousSpe.necessite_competence} onNavigate={onNavigate} />
                    </div>
                )}
                {Object.keys(sousSpe.attributs_automatisables).length > 0 && (
                    <div>
                        <span className="text-leather font-medium">Attributs auto : </span>
                        {formatAutoAttributes(sousSpe.attributs_automatisables)}
                    </div>
                )}
                {Object.keys(sousSpe.attributs_specifiques).length > 0 && (
                    <div>
                        <span className="text-leather font-medium">Attributs spécifiques : </span>
                        {formatSpecAttributes(sousSpe.attributs_specifiques)}
                    </div>
                )}
                {sousSpe.competences_obligatoires && sousSpe.competences_obligatoires.length > 0 && (
                    <div>
                        <span className="text-leather font-medium">Compétences obligatoires : </span>
                        <ClickableCompList comps={sousSpe.competences_obligatoires} onNavigate={onNavigate} />
                    </div>
                )}
                {sousSpe.competences_choix && sousSpe.competences_choix.length > 0 && (
                    <div>
                        <span className="text-leather font-medium">
                            Compétences au choix ({sousSpe.nombre_competences_choix ?? '?'}) :
                        </span>{' '}
                        <ClickableCompList comps={sousSpe.competences_choix} onNavigate={onNavigate} />
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---- Specialisation Card ---- */
function SpecCard({ spe, isExpanded, onToggle, onNavigate }: { spe: Specialisation; isExpanded: boolean; onToggle: () => void; onNavigate?: (name: string) => void }) {
    return (
        <div className="ml-4 mt-2">
            <button
                onClick={onToggle}
                className="w-full text-left bg-parchment/60 border border-leather/20 rounded px-4 py-2 hover:bg-leather/10 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-leather text-xs select-none">{isExpanded ? '▼' : '▶'}</span>
                    <span className="text-sm font-serif font-bold text-leather">
                        {spe.name_m}
                    </span>
                    {spe.name_f && spe.name_f !== spe.name_m && (
                        <span className="text-xs text-ink-light font-serif">/ {spe.name_f}</span>
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="ml-4 mt-1 space-y-1 text-xs font-serif text-ink border-l-2 border-leather/10 pl-3 py-2">
                    {spe.necessite_competence.length > 0 && (
                        <div>
                            <span className="text-leather font-medium">Compétences requises : </span>
                            <ClickableCompList comps={spe.necessite_competence} onNavigate={onNavigate} />
                        </div>
                    )}
                    {Object.keys(spe.attributs_automatisables).length > 0 && (
                        <div>
                            <span className="text-leather font-medium">Attributs auto : </span>
                            {formatAutoAttributes(spe.attributs_automatisables)}
                        </div>
                    )}
                    {Object.keys(spe.attributs_specifiques).length > 0 && (
                        <div>
                            <span className="text-leather font-medium">Attributs spécifiques : </span>
                            {formatSpecAttributes(spe.attributs_specifiques)}
                        </div>
                    )}
                    {spe.competences && spe.competences.length > 0 && (
                        <div>
                            <span className="text-leather font-medium">Compétences : </span>
                            <ClickableCompList comps={spe.competences} onNavigate={onNavigate} />
                        </div>
                    )}

                    {spe.sous_specialisations && spe.sous_specialisations.length > 0 && (
                        <div className="mt-2">
                            <span className="text-leather font-medium text-xs">Sous-spécialisations :</span>
                            {spe.sous_specialisations.map((ss) => (
                                <SousSpecCard key={ss.id} sousSpe={ss} onNavigate={onNavigate} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ---- Métier Card ---- */
function MetierCard({ metier, onNavigate }: { metier: Metier; onNavigate?: (name: string) => void }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());

    const toggleSpec = (specId: string) => {
        setExpandedSpecs((prev) => {
            const next = new Set(prev);
            if (next.has(specId)) next.delete(specId);
            else next.add(specId);
            return next;
        });
    };

    return (
        <div className="border border-leather/20 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left px-5 py-3 bg-leather/10 hover:bg-leather/15 transition-colors flex items-center gap-3"
            >
                <span className="text-leather text-sm select-none">{isExpanded ? '▼' : '▶'}</span>
                <div className="flex-1">
                    <span className="font-serif font-bold text-leather">
                        {metier.name_m}
                    </span>
                    {metier.name_f && metier.name_f !== metier.name_m && (
                        <span className="text-ink-light font-serif text-sm ml-2">/ {metier.name_f}</span>
                    )}
                </div>
                <span className="text-xs text-ink-light font-serif">
                    {formatMinMax(
                        metier.min as unknown as Record<string, number | undefined>,
                        metier.max as unknown as Record<string, number | undefined>
                    )}
                </span>
            </button>

            {isExpanded && (
                <div className="px-5 py-3 space-y-2 text-sm font-serif text-ink">
                    <div className="text-xs">
                        <span className="text-leather font-medium">Min/Max : </span>
                        {formatMinMax(
                            metier.min as unknown as Record<string, number | undefined>,
                            metier.max as unknown as Record<string, number | undefined>
                        )}
                    </div>

                    {metier.competences_obligatoires && metier.competences_obligatoires.length > 0 && (
                        <div className="text-xs">
                            <span className="text-leather font-medium">Compétences obligatoires : </span>
                            <ClickableCompList comps={metier.competences_obligatoires} onNavigate={onNavigate} />
                        </div>
                    )}

                    {metier.competences_choix && metier.competences_choix.length > 0 && (
                        <div className="text-xs">
                            <span className="text-leather font-medium">
                                Compétences au choix ({metier.nombre_competences_choix ?? '?'}) :
                            </span>{' '}
                            <ClickableCompList comps={metier.competences_choix} onNavigate={onNavigate} />
                        </div>
                    )}

                    {metier.specialisations && metier.specialisations.length > 0 && (
                        <div className="mt-2">
                            <span className="text-leather font-medium text-sm">Spécialisations :</span>
                            {metier.specialisations.map((spe) => (
                                <SpecCard
                                    key={spe.id}
                                    spe={spe}
                                    isExpanded={expandedSpecs.has(spe.id)}
                                    onToggle={() => toggleSpec(spe.id)}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ---- Main Page ---- */
export function MetiersPage({ gameRules, onNavigateToCompetence }: MetiersPageProps) {
    if (!gameRules) {
        return <div className="text-leather font-serif italic">Chargement des métiers...</div>;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-serif font-bold text-leather">Métiers & Spécialisations</h1>
            <p className="text-ink-light font-serif text-sm">
                Cliquez sur un métier pour afficher ses détails, compétences et spécialisations.
            </p>

            <div className="space-y-3">
                {gameRules.metiers.map((metier) => (
                    <MetierCard key={metier.id} metier={metier} onNavigate={onNavigateToCompetence} />
                ))}
            </div>
        </div>
    );
}
