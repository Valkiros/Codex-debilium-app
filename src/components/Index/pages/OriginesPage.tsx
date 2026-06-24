import { useState, useMemo } from 'react';
import { GameRules } from '../../../types';
import competencesData from '../../../../src-tauri/data/config/competences.json';

const listeCompetences = competencesData as Array<Record<string, any>>;

const compMap = new Map<number, string>();
for (const c of listeCompetences) {
    if (c.ID != null) compMap.set(Number(c.ID), c.Competence);
}

interface OriginesPageProps {
    gameRules: GameRules | null;
    onNavigateToCompetence?: (name: string) => void;
}

const STAT_KEYS = ['COU', 'INT', 'CHA', 'AD', 'FO'] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-t border-leather/10 pt-3 mt-3 first:border-0 first:pt-0 first:mt-0">
            <h4 className="text-xs font-bold text-leather uppercase tracking-wider mb-2">{title}</h4>
            {children}
        </div>
    );
}

function StatBadge({ label, value }: { label: string; value: any }) {
    if (value == null) return null;
    return (
        <div className="bg-leather/10 rounded px-3 py-1.5 text-center min-w-[70px]">
            <div className="text-[10px] text-leather/70 uppercase font-bold">{label}</div>
            <div className="text-sm font-bold text-leather">{value}</div>
        </div>
    );
}

function CompetenceList({ label, ids, note, onNavigate }: { label: string; ids: any; note?: string; onNavigate?: (name: string) => void }) {
    if ((!ids || (Array.isArray(ids) && ids.length === 0)) && !note) return null;

    const names = Array.isArray(ids) ? ids.map(id => ({ id, name: compMap.get(Number(id)) || `Inconnu (${id})` })) : [];

    return (
        <div>
            <div className="text-xs text-leather font-medium mb-1">{label}</div>
            {names.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {names.map(({ id, name }) => (
                        <button
                            key={id}
                            onClick={() => onNavigate?.(name)}
                            className="text-xs bg-leather/10 hover:bg-leather/20 text-ink px-2 py-0.5 rounded transition-colors cursor-pointer"
                            title={`Voir la compétence : ${name}`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            ) : note ? (
                <div className="text-xs text-ink-light italic">{note}</div>
            ) : null}
        </div>
    );
}

function OrigineCard({ origine, corruptionEffects, onNavigateToCompetence }: { origine: any; corruptionEffects?: string; onNavigateToCompetence?: (name: string) => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const min = (origine.Min || origine.min || {}) as Record<string, any>;
    const max = (origine.Max || origine.max || {}) as Record<string, any>;
    const name_m = origine.Name_M || origine.name_m;
    const name_f = origine.Name_F || origine.name_f;

    const sens = origine.Sens;

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
            </button>

            {isExpanded && (
                <div className="px-5 py-4 space-y-0 text-sm font-serif text-ink">

                    {/* Caractéristiques & Combat */}
                    <Section title="Caractéristiques & Combat">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {STAT_KEYS.map(key => {
                                const minV = min[key] ?? min[key === 'COU' ? 'COUR' : key];
                                const maxV = max[key] ?? max[key === 'COU' ? 'COUR' : key];
                                if (minV == null && maxV == null) return null;
                                return <StatBadge key={key} label={key} value={`${minV ?? '-'} / ${maxV ?? '-'}`} />;
                            })}
                            <StatBadge label="AT" value={origine.AT} />
                            <StatBadge label="PRD" value={origine.PRD} />
                        </div>
                    </Section>

                    {/* Vitalité */}
                    <Section title="Vitalité & Énergie">
                        <div className="flex flex-wrap gap-2">
                            <StatBadge label="EV init." value={origine.EV_initiale} />
                            <StatBadge label="EV/niv." value={origine.EV_par_niveau} />
                            <StatBadge label="EA init." value={origine.EA_initiale} />
                            <StatBadge label="EA/niv." value={origine.EA_par_niveau} />
                        </div>
                    </Section>

                    {/* Physique */}
                    <Section title="Physique & Déplacement">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <StatBadge label="Vitesse" value={origine.Vitesse} />
                            <StatBadge label="Taille" value={origine.Taille} />
                            <StatBadge label="PR Sol. max" value={origine.PR_sol_max} />
                            <StatBadge label="Transport" value={origine.Transport_max} />
                        </div>
                        {origine.Langues && origine.Langues.length > 0 && (
                            <div className="text-xs text-ink-light mt-1">
                                <span className="text-leather font-medium">Langues : </span>{origine.Langues.join(', ')}
                            </div>
                        )}
                    </Section>

                    {/* Sens */}
                    {sens && Object.values(sens).some(v => v != null) && (
                        <Section title="Sens">
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(sens).filter(([, v]) => v != null).map(([k, v]) => (
                                    <StatBadge key={k} label={k} value={v as string} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Bonus */}
                    {(origine.Bonus_origine && Object.keys(origine.Bonus_origine).length > 0) || (origine.Bonus_origine_conditionnel && origine.Bonus_origine_conditionnel.length > 0) ? (
                        <Section title="Bonus d'origine">
                            {origine.Bonus_origine && Object.keys(origine.Bonus_origine).length > 0 && (
                                <div className="text-xs text-ink mb-1">
                                    {Object.entries(origine.Bonus_origine).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </div>
                            )}
                            {origine.Bonus_origine_conditionnel && origine.Bonus_origine_conditionnel.length > 0 && (
                                <ul className="list-disc list-inside text-xs text-ink-light space-y-0.5">
                                    {origine.Bonus_origine_conditionnel.map((b: any, i: number) => (
                                        <li key={i}>{typeof b === 'string' ? b : JSON.stringify(b)}</li>
                                    ))}
                                </ul>
                            )}
                        </Section>
                    ) : null}

                    {/* Compétences */}
                    <Section title="Compétences">
                        <div className="space-y-3">
                            <CompetenceList label="Innées" ids={origine.Competences_innees} onNavigate={onNavigateToCompetence} />
                            <CompetenceList
                                label={`Au choix à la création (${origine.Competences_choix_creation_nb || 0})`}
                                ids={origine.Competences_choix_creation}
                                note={origine.Competences_choix_creation_note}
                                onNavigate={onNavigateToCompetence}
                            />
                            <CompetenceList
                                label={`Développables (${origine.Competences_developpables_nb || 0} au choix)`}
                                ids={origine.Competences_developpables}
                                note={origine.Competences_developpables_note}
                                onNavigate={onNavigateToCompetence}
                            />
                        </div>
                    </Section>

                    {/* Équipement & Restrictions */}
                    {((origine.Materiel && origine.Materiel.length > 0) || (origine.Restrictions_equipement && origine.Restrictions_equipement.length > 0) || (origine.Metiers_impossibles && origine.Metiers_impossibles.length > 0) || (origine.metiers_impossibles && origine.metiers_impossibles.length > 0) || (origine.Metiers_exclusifs && origine.Metiers_exclusifs.length > 0)) && (
                        <Section title="Équipement & Restrictions">
                            {origine.Materiel && origine.Materiel.length > 0 && (
                                <div className="text-xs mb-1"><span className="text-leather font-medium">Matériel : </span>{origine.Materiel.join(', ')}</div>
                            )}
                            {origine.Restrictions_equipement && origine.Restrictions_equipement.length > 0 && (
                                <div className="text-xs mb-1"><span className="text-leather font-medium">Restrictions : </span>{origine.Restrictions_equipement.join(', ')}</div>
                            )}
                            {(origine.Metiers_impossibles || origine.metiers_impossibles) && (origine.Metiers_impossibles || origine.metiers_impossibles).length > 0 && (
                                <div className="text-xs mb-1"><span className="text-leather font-medium">Métiers interdits : </span>{(origine.Metiers_impossibles || origine.metiers_impossibles).join(', ')}</div>
                            )}
                            {origine.Metiers_exclusifs && origine.Metiers_exclusifs.length > 0 && (
                                <div className="text-xs mb-1"><span className="text-leather font-medium">Métiers exclusifs : </span>{origine.Metiers_exclusifs.join(', ')}</div>
                            )}
                        </Section>
                    )}

                    {/* Notes */}
                    {origine.Notes_speciales && (
                        <Section title="Notes spéciales">
                            <div className="text-xs text-ink italic">{origine.Notes_speciales}</div>
                        </Section>
                    )}

                    {/* Corruption */}
                    {corruptionEffects && corruptionEffects !== 'Aucun effet' && corruptionEffects !== 'Pas d\'effet' && (
                        <Section title="Corruption">
                            <ul className="list-disc list-inside text-xs text-ink-light space-y-0.5">
                                {corruptionEffects.split('|').map((effect, i) => (
                                    <li key={i}>{effect.trim()}</li>
                                ))}
                            </ul>
                        </Section>
                    )}
                </div>
            )}
        </div>
    );
}

export function OriginesPage({ gameRules, onNavigateToCompetence }: OriginesPageProps) {
    if (!gameRules) {
        return <div className="text-leather font-serif italic">Chargement des origines...</div>;
    }

    const corruptionByName = useMemo(() => {
        const map = new Map<string, string>();
        if (gameRules.corruption_origine) {
            for (const entry of gameRules.corruption_origine as any[]) {
                map.set(entry.Masculin, entry.Effets);
                if (entry.Féminin) map.set(entry.Féminin, entry.Effets);
            }
        }
        return map;
    }, [gameRules.corruption_origine]);

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
                        onNavigateToCompetence={onNavigateToCompetence}
                    />
                ))}
            </div>
        </div>
    );
}
