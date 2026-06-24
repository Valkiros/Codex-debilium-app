const COLS = ['COU', 'INT', 'CHA', 'AD', 'FO', 'PER', 'ES', 'AT', 'PRD', 'PI'] as const;

interface AlcoholRow {
    dose: number;
    COU: number; INT: number; CHA: number; AD: number; FO: number;
    PER: number; ES: number; AT: number; PRD: number; PI: number;
}

// ---- Données Alcool Léger ----
const ALCOOL_LEGER: AlcoholRow[] = [
    { dose: 1, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 2, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 3, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 4, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 5, COU: 1, INT: -1, CHA: 0, AD: 0, FO: 0, PER: -1, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 6, COU: 1, INT: -1, CHA: 0, AD: -1, FO: 0, PER: -1, ES: 0, AT: 1, PRD: 0, PI: 0 },
    { dose: 7, COU: 2, INT: -2, CHA: -1, AD: -2, FO: 0, PER: -2, ES: 0, AT: 1, PRD: 0, PI: 0 },
    { dose: 8, COU: 2, INT: -2, CHA: -2, AD: -2, FO: 1, PER: -2, ES: 0, AT: 1, PRD: 0, PI: 0 },
    { dose: 9, COU: 3, INT: -3, CHA: -3, AD: -3, FO: 2, PER: -3, ES: 0, AT: 2, PRD: -2, PI: -2 },
    { dose: 10, COU: 3, INT: -3, CHA: -4, AD: -3, FO: 2, PER: -3, ES: 0, AT: 2, PRD: -2, PI: -2 },
];

// ---- Données Alcool Fort ----
const ALCOOL_FORT: AlcoholRow[] = [
    { dose: 1, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 2, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 3, COU: 0, INT: -1, CHA: 0, AD: -1, FO: 0, PER: -1, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 4, COU: 1, INT: -1, CHA: -1, AD: -2, FO: 0, PER: -1, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 5, COU: 1, INT: -2, CHA: -1, AD: -2, FO: 1, PER: -2, ES: 0, AT: -1, PRD: -1, PI: 0 },
    { dose: 6, COU: 2, INT: -2, CHA: -2, AD: -3, FO: 2, PER: -2, ES: 0, AT: 1, PRD: -2, PI: -2 },
    { dose: 7, COU: 2, INT: -3, CHA: -2, AD: -3, FO: 2, PER: -3, ES: 0, AT: 1, PRD: -2, PI: -2 },
    { dose: 8, COU: 3, INT: -3, CHA: -3, AD: -3, FO: 3, PER: -3, ES: 0, AT: 2, PRD: -3, PI: -3 },
    { dose: 9, COU: 3, INT: -3, CHA: -4, AD: -3, FO: 3, PER: -3, ES: 0, AT: 2, PRD: -3, PI: 1 },
    { dose: 10, COU: 3, INT: -3, CHA: -5, AD: -3, FO: 3, PER: -3, ES: 0, AT: 2, PRD: -3, PI: 2 },
];

// ---- Données Gueule de Bois ----
const GUEULE_DE_BOIS: AlcoholRow[] = [
    { dose: 1, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 2, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 3, COU: 0, INT: 0, CHA: 0, AD: 0, FO: 0, PER: 0, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 4, COU: 0, INT: -1, CHA: 0, AD: 0, FO: 0, PER: -1, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 5, COU: 0, INT: -1, CHA: 0, AD: 0, FO: 0, PER: -1, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 6, COU: 0, INT: -1, CHA: -1, AD: 0, FO: 0, PER: -1, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 7, COU: 0, INT: -1, CHA: -1, AD: 0, FO: 0, PER: -1, ES: 0, AT: 0, PRD: 0, PI: 0 },
    { dose: 8, COU: 0, INT: -2, CHA: -1, AD: -1, FO: 0, PER: -2, ES: 0, AT: -1, PRD: -1, PI: 0 },
    { dose: 9, COU: 0, INT: -2, CHA: -2, AD: -1, FO: 0, PER: -2, ES: 0, AT: -1, PRD: -1, PI: 0 },
    { dose: 10, COU: 0, INT: -2, CHA: -3, AD: -2, FO: 0, PER: -2, ES: -1, AT: -1, PRD: -1, PI: 0 },
];

function formatModifier(val: number): string {
    if (val === 0) return '-';
    return val > 0 ? `+${val}` : String(val);
}

function AlcoholTable({ title, data }: { title: string; data: AlcoholRow[] }) {
    return (
        <div className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-leather">{title}</h2>
            <div className="overflow-x-auto">
                <table className="border-collapse text-sm font-serif w-full">
                    <thead>
                        <tr className="bg-leather/10">
                            <th className="border border-leather/20 px-2 py-1 text-center text-leather font-bold">Dose</th>
                            {COLS.map((col) => (
                                <th key={col} className="border border-leather/20 px-2 py-1 text-center text-leather font-bold">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={row.dose} className={idx % 2 !== 0 ? 'bg-leather/5' : ''}>
                                <td className="border border-leather/20 px-2 py-1 text-center text-ink font-medium">
                                    {row.dose}
                                </td>
                                {COLS.map((col) => {
                                    const val = row[col];
                                    return (
                                        <td
                                            key={col}
                                            className={`border border-leather/20 px-2 py-1 text-center ${
                                                val > 0 ? 'text-green-700' : val < 0 ? 'text-red-700' : 'text-ink-light'
                                            }`}
                                        >
                                            {formatModifier(val)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function AlcoolDroguesPage() {
    return (
        <div className="space-y-8 font-serif">
            <h1 className="text-2xl font-bold text-leather">Alcool & Drogues</h1>
            <p className="text-ink-light text-sm">
                Tables des modificateurs appliqués selon le nombre de doses consommées.
            </p>

            {/* ---- Tables d'alcool ---- */}
            <AlcoholTable title="Alcool Léger" data={ALCOOL_LEGER} />
            <AlcoholTable title="Alcool Fort" data={ALCOOL_FORT} />
            <AlcoholTable title="Gueule de Bois" data={GUEULE_DE_BOIS} />

            {/* ---- Drogues ---- */}
            <section className="space-y-3">
                <h2 className="text-lg font-bold text-leather">Drogues</h2>
                <p className="text-sm text-ink">
                    Les drogues infligent un malus aux caractéristiques basé sur le nombre de jours de retard
                    depuis la dernière prise.
                </p>
                <div className="overflow-x-auto">
                    <table className="border-collapse text-sm w-full">
                        <thead>
                            <tr className="bg-leather/10">
                                <th className="border border-leather/20 px-3 py-2 text-left text-leather font-bold">Type</th>
                                <th className="border border-leather/20 px-3 py-2 text-left text-leather font-bold">Formule du malus</th>
                                <th className="border border-leather/20 px-3 py-2 text-left text-leather font-bold">Application</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-leather/20 px-3 py-2 text-ink font-medium">ADD</td>
                                <td className="border border-leather/20 px-3 py-2 text-ink">
                                    <code className="text-xs">plancher(jours_retard / 2) x -1</code>
                                </td>
                                <td className="border border-leather/20 px-3 py-2 text-ink text-xs">
                                    Toutes les caractéristiques
                                </td>
                            </tr>
                            <tr className="bg-leather/5">
                                <td className="border border-leather/20 px-3 py-2 text-ink font-medium">ADD+</td>
                                <td className="border border-leather/20 px-3 py-2 text-ink">
                                    <code className="text-xs">jours_retard x -1</code>
                                </td>
                                <td className="border border-leather/20 px-3 py-2 text-ink text-xs">
                                    Toutes les caractéristiques
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-leather/20 px-3 py-2 text-ink font-medium">ADD++</td>
                                <td className="border border-leather/20 px-3 py-2 text-ink">
                                    <code className="text-xs">jours_retard x -1</code>
                                </td>
                                <td className="border border-leather/20 px-3 py-2 text-ink text-xs">
                                    Toutes les caractéristiques
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
