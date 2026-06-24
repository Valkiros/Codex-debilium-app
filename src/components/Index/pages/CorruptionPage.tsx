import { GameRules, CorruptionOrigineRef, CorruptionPalierRef } from '../../../types';

interface CorruptionPageProps {
    gameRules: GameRules | null;
}

function parseEffects(effects: string): string[] {
    if (!effects) return [];
    return effects.split('|').map((e) => e.trim()).filter(Boolean);
}

export function CorruptionPage({ gameRules }: CorruptionPageProps) {
    if (!gameRules) {
        return <div className="text-leather font-serif italic">Chargement des données de corruption...</div>;
    }

    const corruptionOrigine = gameRules.corruption_origine as CorruptionOrigineRef[];
    const corruptionPalier = gameRules.corruption_palier as CorruptionPalierRef[];

    return (
        <div className="space-y-8 font-serif">
            <h1 className="text-2xl font-bold text-leather">Corruption</h1>
            <p className="text-ink-light text-sm">
                Effets de la corruption selon l'origine du personnage et les paliers atteints.
            </p>

            {/* ---- Effets par Origine ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Effets par origine</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-leather/10">
                                <th className="border border-leather/20 px-3 py-2 text-left text-leather font-bold w-48">
                                    Origine (M / F)
                                </th>
                                <th className="border border-leather/20 px-3 py-2 text-left text-leather font-bold">
                                    Effets
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {corruptionOrigine.map((entry, idx) => {
                                const effects = parseEffects(entry.Effets);
                                return (
                                    <tr key={idx} className={idx % 2 !== 0 ? 'bg-leather/5' : ''}>
                                        <td className="border border-leather/20 px-3 py-2 text-ink font-medium whitespace-nowrap align-top">
                                            {entry.Masculin}
                                            {entry['Féminin'] && entry['Féminin'] !== entry.Masculin && (
                                                <span className="text-ink-light"> / {entry['Féminin']}</span>
                                            )}
                                        </td>
                                        <td className="border border-leather/20 px-3 py-2 text-ink">
                                            {effects.length > 1 ? (
                                                <ul className="list-disc pl-4 space-y-0.5">
                                                    {effects.map((effect, i) => (
                                                        <li key={i} className="text-xs">{effect}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-xs">{effects[0] || '-'}</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---- Paliers de Corruption ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Paliers de corruption</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-leather/10">
                                <th className="border border-leather/20 px-2 py-2 text-center text-leather font-bold">Palier (%)</th>
                                <th className="border border-leather/20 px-2 py-2 text-center text-leather font-bold">Aura Chao. (arme)</th>
                                <th className="border border-leather/20 px-2 py-2 text-center text-leather font-bold">Aura Div. (arme)</th>
                                <th className="border border-leather/20 px-2 py-2 text-center text-leather font-bold">Aura Chao. (prot.)</th>
                                <th className="border border-leather/20 px-2 py-2 text-center text-leather font-bold">RM</th>
                                <th className="border border-leather/20 px-2 py-2 text-center text-leather font-bold">FO</th>
                                <th className="border border-leather/20 px-2 py-2 text-center text-leather font-bold">INT</th>
                                <th className="border border-leather/20 px-2 py-2 text-center text-leather font-bold">CHA</th>
                                <th className="border border-leather/20 px-3 py-2 text-left text-leather font-bold">Effets</th>
                            </tr>
                        </thead>
                        <tbody>
                            {corruptionPalier.map((palier, idx) => {
                                const effects = parseEffects(palier.Effets);
                                return (
                                    <tr key={idx} className={idx % 2 !== 0 ? 'bg-leather/5' : ''}>
                                        <td className="border border-leather/20 px-2 py-2 text-center text-ink font-medium">
                                            {palier.Paliers}
                                        </td>
                                        <td className="border border-leather/20 px-2 py-2 text-center text-ink">
                                            {palier['Aura chaotique (arme)'] || 0}
                                        </td>
                                        <td className="border border-leather/20 px-2 py-2 text-center text-ink">
                                            {palier['Aura divine (arme)'] || 0}
                                        </td>
                                        <td className="border border-leather/20 px-2 py-2 text-center text-ink">
                                            {palier['Aura chaotique (protection)'] || 0}
                                        </td>
                                        <td className="border border-leather/20 px-2 py-2 text-center text-ink">
                                            {palier['Résistance magique (RM)'] || 0}
                                        </td>
                                        <td className="border border-leather/20 px-2 py-2 text-center text-ink">
                                            {palier['Force (FO)'] || 0}
                                        </td>
                                        <td className="border border-leather/20 px-2 py-2 text-center text-ink">
                                            {palier['Intelligence (INT)'] || 0}
                                        </td>
                                        <td className="border border-leather/20 px-2 py-2 text-center text-ink">
                                            {palier['Charisme (CHA)'] || 0}
                                        </td>
                                        <td className="border border-leather/20 px-3 py-2 text-ink">
                                            {effects.length > 1 ? (
                                                <ul className="list-disc pl-4 space-y-0.5">
                                                    {effects.map((effect, i) => (
                                                        <li key={i} className="text-xs">{effect}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-xs">{effects[0] || '-'}</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
