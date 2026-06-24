import { GameRules } from '../types';

interface Identity {
    metier: string;
    specialisation?: string;
    sous_specialisation?: string;
}

interface SpecData {
    specBonuses: Record<string, number>;
    subSpecBonuses: Record<string, number>;
}

export function getSpecData(gameRules: GameRules | null, identity: Identity): SpecData {
    if (!gameRules) return { specBonuses: {}, subSpecBonuses: {} };

    const currentMetier = gameRules.metiers.find(
        (m: any) => m.name_m === identity.metier || m.name_f === identity.metier
    );
    if (!currentMetier) return { specBonuses: {}, subSpecBonuses: {} };

    const specBonuses: Record<string, number> = {};
    const subSpecBonuses: Record<string, number> = {};

    if (identity.specialisation) {
        const spec = currentMetier.specialisations?.find(
            (s: any) => s.name_m === identity.specialisation || s.name_f === identity.specialisation
        );
        const attrs = spec?.attributs_automatisables || (spec as any)?.Attributs_automatisables;
        if (attrs) {
            for (const [key, value] of Object.entries(attrs)) {
                specBonuses[key] = (specBonuses[key] || 0) + (value as number);
            }
        }
    }

    if (identity.sous_specialisation && identity.specialisation) {
        const spec = currentMetier.specialisations?.find(
            (s: any) => s.name_m === identity.specialisation || s.name_f === identity.specialisation
        );
        const subSpec = spec?.sous_specialisations?.find(
            (s: any) => s.name_m === identity.sous_specialisation || s.name_f === identity.sous_specialisation
        );
        const attrs = subSpec?.attributs_automatisables || (subSpec as any)?.Attributs_automatisables;
        if (attrs) {
            for (const [key, value] of Object.entries(attrs)) {
                subSpecBonuses[key] = (subSpecBonuses[key] || 0) + (value as number);
            }
        }
    }

    return { specBonuses, subSpecBonuses };
}
