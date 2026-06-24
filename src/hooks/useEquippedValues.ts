import React from 'react';
import { CharacterData, Characteristics, Equipement } from '../types';
import { INITIAL_DATA } from '../constants';
import { getAlcoholModifiers } from '../utils/alcohol';
import { getItemWeight } from '../utils/sacUtils';
import { getSpecData } from '../utils/specUtils';

type ComponentEntry = { label: string; value: number; displayValue?: string };
type CharValue = { value: number; components: ComponentEntry[]; overrideDisplay?: string };

function getFatigueModifier(etat: string): number {
    if (etat === 'Reposé') return 1;
    if (etat && etat.startsWith('Epuisé')) {
        const parts = etat.split(' ');
        if (parts.length > 1) {
            const level = parseInt(parts[1], 10);
            return -level;
        }
    }
    return 0;
}

const KEY_MAP: Record<string, keyof Characteristics> = {
    'COU': 'courage',
    'INT': 'intelligence',
    'CHA': 'charisme',
    'AD': 'adresse',
    'FO': 'force',
    'PER': 'perception',
    'ES': 'esquive',
    'AT': 'attaque',
    'PRD': 'parade',
    'DEG': 'degats'
};

export function useEquippedValues(
    data: CharacterData,
    refs: any[],
    gameRules: any
) {
    const refsById = React.useMemo(() => {
        const map = new Map<number, any>();
        for (const r of refs) map.set(r.id, r);
        return map;
    }, [refs]);

    const currentEncumbrance = React.useMemo(() => {
        let totalSolide = 0;
        data.inventory.forEach(item => {
            const type = item.equipement_type as string;
            if (['Protections', 'Accessoires'].includes(type)) {
                const refItem = refsById.get(item.refId);
                if (refItem?.details?.type === 'Bouclier' && !data.defenses.bouclier_actif) return;
                const protections = refItem?.protections || refItem?.raw?.protections || {};
                const baseSol = parseInt(String(protections.pr_sol || 0), 10);
                const modSol = parseInt(String(item.modif_pr_sol || 0), 10);
                totalSolide += (baseSol + modSol);
            }
        });
        totalSolide += (data.defenses.solide.temp || 0);
        return totalSolide;
    }, [data.inventory, data.defenses.solide.temp, data.defenses.bouclier_actif, refsById]);

    const equippedValues = React.useMemo(() => {
        const values: Record<keyof Characteristics, CharValue> = {
            courage: { value: 0, components: [] },
            intelligence: { value: 0, components: [] },
            charisme: { value: 0, components: [] },
            adresse: { value: 0, components: [] },
            force: { value: 0, components: [] },
            perception: { value: 0, components: [] },
            esquive: { value: 0, components: [] },
            attaque: { value: 0, components: [] },
            parade: { value: 0, components: [] },
            degats: { value: 0, components: [] }
        };

        const fatigueMod = getFatigueModifier(data.status?.fatigue?.etat);
        const { leger, fort, gueule_de_bois } = getAlcoholModifiers(data.status || INITIAL_DATA.status);
        const isFlibustier = data.identity.specialisation?.toLowerCase() === 'flibustier';
        const { specBonuses, subSpecBonuses } = getSpecData(gameRules, data.identity);

        // Backpack encumbrance
        const sacItems = data.inventory.filter(i => i.equipement_type === 'Sacs');
        const backpack = sacItems.find(i => {
            const ref = refsById.get(i.refId);
            return ref?.category === 'Sacs';
        });

        let sacMalus = 0;
        if (backpack) {
            const refBackpack = refsById.get(backpack.refId);
            const capacityRaw = (refBackpack as any)?.details?.capacite || 0;
            const capacity = typeof capacityRaw === 'string' ? parseInt(capacityRaw) : capacityRaw;
            const contentWeight = sacItems
                .filter(i => i.uid !== backpack.uid)
                .reduce((acc, item) => {
                    const refItem = refsById.get(item.refId);
                    const unitWeight = getItemWeight(refItem);
                    return acc + (unitWeight * (item.quantite ?? 1));
                }, 0);

            if (capacity > 0 && contentWeight >= (0.9 * capacity)) {
                sacMalus = -2;
            }
        }

        (Object.keys(values) as Array<keyof Characteristics>).forEach((key) => {
            const char = data.characteristics[key];
            const naturel = char.naturel || 0;
            const t1 = char.t1 || 0;
            const t2 = char.t2 || 0;
            const t3 = char.t3 || 0;
            const malusTete = data.general.malus_tete || 0;

            const components: ComponentEntry[] = [];
            if (naturel !== 0) components.push({ label: 'Naturel', value: naturel });
            if (t1 !== 0) components.push({ label: 'T1', value: t1 });
            if (t2 !== 0) components.push({ label: 'T2', value: t2 });
            if (t3 !== 0) components.push({ label: 'T3', value: t3 });
            if (malusTete !== 0) components.push({ label: 'Malus Tête', value: -malusTete });

            const etatFatigue = data.status?.fatigue?.etat || 'Normal';
            if (fatigueMod !== 0) components.push({ label: `Etat de fatigue (${etatFatigue})`, value: fatigueMod });

            if (key in leger) {
                const val = (leger as any)[key];
                if (val !== 0) components.push({ label: 'Alcool (léger)', value: val });
            }
            if (key in fort) {
                const val = (fort as any)[key];
                let effectiveVal = val;
                if (isFlibustier && val < 0) effectiveVal = 0;
                if (effectiveVal !== 0) components.push({ label: 'Alcool (fort)', value: effectiveVal });
            }
            if (key in gueule_de_bois) {
                const val = (gueule_de_bois as any)[key];
                if (val !== 0) components.push({ label: 'Gueule de bois', value: val });
            }

            // Drug malus
            const drug = data.status?.drug || { type: 'Aucune', jours_retard: 0 };
            let drugMalus = 0;
            if (drug.type === 'ADD') {
                drugMalus = Math.floor(drug.jours_retard / 2) * -1;
            } else if (drug.type === 'ADD+' || drug.type === 'ADD++') {
                drugMalus = drug.jours_retard * -1;
            }
            if (drugMalus !== 0) {
                components.push({ label: `Manque (Drogue: ${drug.type})`, value: drugMalus });
            }

            // AD > 12 bonus
            if (data.general.bonus_ad_12) {
                if (key === 'attaque' && data.general.bonus_ad_12 === 'AT') {
                    components.push({ label: 'Base AD > 12', value: 1 });
                }
                if (key === 'parade' && data.general.bonus_ad_12 === 'PRD') {
                    components.push({ label: 'Base AD > 12', value: 1 });
                }
            }

            // Specialization bonuses
            const specKey = Object.keys(KEY_MAP).find(k => KEY_MAP[k] === key);
            if (specKey && specBonuses[specKey]) {
                components.push({ label: 'Spécialisation', value: specBonuses[specKey] });
            }
            if (specKey && subSpecBonuses[specKey]) {
                components.push({ label: 'Sous-spécialisation', value: subSpecBonuses[specKey] });
            }

            // Encumbrance (Esquive only)
            let encumbranceMalus = 0;
            if (key === 'esquive') {
                if (currentEncumbrance >= 0 && currentEncumbrance <= 1) encumbranceMalus = 1;
                else if (currentEncumbrance === 2) encumbranceMalus = 0;
                else if (currentEncumbrance >= 3 && currentEncumbrance <= 4) encumbranceMalus = -2;
                else if (currentEncumbrance === 5) encumbranceMalus = -4;
                else if (currentEncumbrance === 6) encumbranceMalus = -5;
                else if (currentEncumbrance === 7) encumbranceMalus = -6;
                else if (currentEncumbrance > 7) encumbranceMalus = -999;

                if (encumbranceMalus !== 0) {
                    const label = encumbranceMalus > 0 ? 'Légèreté' : 'Encombrement';
                    components.push({
                        label: `${label} (PR Sol. ${currentEncumbrance})`,
                        value: encumbranceMalus,
                        displayValue: currentEncumbrance > 7 ? "Impossible" : undefined
                    });
                }

                if (currentEncumbrance > 7) {
                    values[key].overrideDisplay = "Imp.";
                }
            }

            let base = naturel + t1 + t2 + t3 - malusTete + fatigueMod;

            if (key in leger) base += (leger as any)[key];
            if (key in fort) {
                const val = (fort as any)[key];
                if (!isFlibustier || val >= 0) base += val;
            }
            if (key in gueule_de_bois) base += (gueule_de_bois as any)[key];

            base += drugMalus;

            if (specKey && specBonuses[specKey]) base += specBonuses[specKey];
            if (specKey && subSpecBonuses[specKey]) base += subSpecBonuses[specKey];

            if (data.general.bonus_ad_12) {
                if (key === 'attaque' && data.general.bonus_ad_12 === 'AT') base += 1;
                if (key === 'parade' && data.general.bonus_ad_12 === 'PRD') base += 1;
            }

            if (key === 'esquive') {
                base += encumbranceMalus;
                base += sacMalus;
                if (sacMalus !== 0) {
                    components.push({ label: 'Sac surchargé', value: sacMalus });
                }
            }

            values[key].value = base;
            values[key].components = components;
        });

        // Inventory bonuses (Protections & Accessories)
        data.inventory.forEach((item: Equipement) => {
            if (['Protections', 'Accessoires'].includes(item.equipement_type as string)) {
                const refItem = refsById.get(item.refId);
                if (refItem?.details?.type === 'Bouclier' && !data.defenses.bouclier_actif) return;

                const caracs = refItem?.raw?.caracteristiques || refItem?.caracteristiques;
                if (caracs) {
                    Object.entries(caracs).forEach(([key, val]) => {
                        const normalizedKey = key.toLowerCase();
                        const bonus = parseInt(String(val || 0), 10);
                        if (bonus !== 0 && normalizedKey in values) {
                            values[normalizedKey as keyof Characteristics].value += bonus;
                            values[normalizedKey as keyof Characteristics].components.push({
                                label: refItem?.nom,
                                value: bonus
                            });
                        }
                    });
                }
            }
        });

        return values;
    }, [data.characteristics, data.status, data.general.malus_tete, data.inventory, data.defenses.bouclier_actif, refsById, currentEncumbrance, data.identity, gameRules]);

    return { equippedValues, currentEncumbrance };
}
