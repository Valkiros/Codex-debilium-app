export function FormulesPage() {
    return (
        <div className="space-y-8 font-serif">
            <h1 className="text-2xl font-bold text-leather">Formules & Calculs</h1>
            <p className="text-ink-light text-sm">
                Référence des formules utilisées pour le calcul des statistiques du personnage.
            </p>

            {/* ---- Caractéristiques (Équipé) ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Caractéristiques (Équipé)</h2>
                <div className="bg-parchment/60 border border-leather/20 rounded px-4 py-3">
                    <code className="text-sm text-ink block whitespace-pre-wrap">
                        Valeur = Naturel + T1 + T2 + T3 - Malus Tête + Fatigue + Alcool + Drogue + Spécialisation + Bonus Équipement
                    </code>
                </div>
                <div className="text-sm text-ink space-y-1 pl-2">
                    <p><span className="text-leather font-medium">Fatigue :</span></p>
                    <ul className="list-disc pl-6 text-ink-light text-xs space-y-0.5">
                        <li>Reposé = +1</li>
                        <li>Normal / Fatigué = 0</li>
                        <li>Épuisé N = -N</li>
                    </ul>
                </div>
            </section>

            {/* ---- Esquive ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Esquive (cas spécial)</h2>
                <div className="bg-parchment/60 border border-leather/20 rounded px-4 py-3">
                    <code className="text-sm text-ink block whitespace-pre-wrap">
                        Esquive = Naturel + T1 + T2 + T3 - Malus Tête + Fatigue + Alcool + Drogue + Spécialisation + Bonus Équipement + Encombrement PR Solide
                    </code>
                </div>

                <p className="text-sm text-leather font-medium">Table d'encombrement PR Solide (Esquive) :</p>
                <div className="overflow-x-auto">
                    <table className="border-collapse text-sm">
                        <thead>
                            <tr className="bg-leather/10">
                                <th className="border border-leather/20 px-3 py-1 text-leather font-bold text-left">PR Solide</th>
                                <th className="border border-leather/20 px-3 py-1 text-leather font-bold text-center">Modificateur ES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { pr: '0-1', mod: '+1 (Légèreté)' },
                                { pr: '2', mod: '0' },
                                { pr: '3-4', mod: '-2' },
                                { pr: '5', mod: '-4' },
                                { pr: '6', mod: '-5' },
                                { pr: '7', mod: '-6' },
                                { pr: '>7', mod: 'Impossible' },
                            ].map((row, i) => (
                                <tr key={row.pr} className={i % 2 !== 0 ? 'bg-leather/5' : ''}>
                                    <td className="border border-leather/20 px-3 py-1 text-ink">{row.pr}</td>
                                    <td className="border border-leather/20 px-3 py-1 text-center text-ink">{row.mod}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---- Protections ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Protections</h2>
                <div className="bg-parchment/60 border border-leather/20 rounded px-4 py-3 space-y-1">
                    <code className="text-sm text-ink block">
                        PR Solide = Somme(Base item + Modif item) pour Protections + Accessoires
                    </code>
                    <code className="text-sm text-ink block">
                        PR Spéciale = Somme(Base item + Modif item) pour Protections + Accessoires
                    </code>
                    <code className="text-sm text-ink block">
                        PR Magique = Somme(Base item + Modif item) pour Protections + Accessoires
                    </code>
                </div>
            </section>

            {/* ---- Magie & Résistance ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Magie & Résistance</h2>
                <div className="bg-parchment/60 border border-leather/20 rounded px-4 py-3 space-y-1">
                    <code className="text-sm text-ink block">
                        Magie Physique = plafond((INT + AD) / 2) + Bonus items
                    </code>
                    <code className="text-sm text-ink block">
                        Magie Psychique = plafond((INT + CHA) / 2) + Bonus items
                    </code>
                    <code className="text-sm text-ink block">
                        Résistance Magique = plafond((COU + INT + FO) / 3) + Bonus items
                    </code>
                    <code className="text-sm text-ink block">
                        Discrétion = AD Naturel + Bonus items
                    </code>
                </div>
            </section>

            {/* ---- Mouvement ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Mouvement</h2>
                <div className="bg-parchment/60 border border-leather/20 rounded px-4 py-3 space-y-1">
                    <code className="text-sm text-ink block">
                        Marche = plafond(Vitesse x Multiplicateur / 100) + Bonus items
                    </code>
                    <code className="text-sm text-ink block">
                        Course = plafond(Vitesse x Multiplicateur / 100) + Bonus items
                    </code>
                </div>

                <p className="text-sm text-leather font-medium">Table PR Solide / Multiplicateur de mouvement :</p>
                <div className="overflow-x-auto">
                    <table className="border-collapse text-sm">
                        <thead>
                            <tr className="bg-leather/10">
                                <th className="border border-leather/20 px-3 py-1 text-leather font-bold text-left">PR Solide</th>
                                <th className="border border-leather/20 px-3 py-1 text-leather font-bold text-center">Marche (x)</th>
                                <th className="border border-leather/20 px-3 py-1 text-leather font-bold text-center">Course (x)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { pr: '0-1', marche: '8', course: '12' },
                                { pr: '2', marche: '6', course: '10' },
                                { pr: '3-5', marche: '4', course: '8' },
                                { pr: '6', marche: '3', course: '6' },
                                { pr: '7', marche: '2', course: '4' },
                                { pr: '>7', marche: '1', course: '2' },
                            ].map((row, i) => (
                                <tr key={row.pr} className={i % 2 !== 0 ? 'bg-leather/5' : ''}>
                                    <td className="border border-leather/20 px-3 py-1 text-ink">{row.pr}</td>
                                    <td className="border border-leather/20 px-3 py-1 text-center text-ink">{row.marche}</td>
                                    <td className="border border-leather/20 px-3 py-1 text-center text-ink">{row.course}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ---- Dégâts ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Dégâts</h2>
                <div className="bg-parchment/60 border border-leather/20 rounded px-4 py-3 space-y-1">
                    <code className="text-sm text-ink block">
                        Total = Dés + PI base + Modif PI + Bonus FO
                    </code>
                    <code className="text-sm text-ink-light block text-xs mt-1">
                        Bonus FO = max(0, FO totale - 12)
                    </code>
                </div>
            </section>

            {/* ---- Niveau ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Niveau</h2>
                <div className="bg-parchment/60 border border-leather/20 rounded px-4 py-3">
                    <code className="text-sm text-ink block">
                        Niveau = plancher((1 + racine(1 + 4 x (XP / 50))) / 2)
                    </code>
                </div>
                <p className="text-xs text-ink-light pl-2">
                    Formule quadratique inverse : chaque niveau nécessite progressivement plus d'XP.
                </p>
            </section>
        </div>
    );
}
