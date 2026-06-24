import React from 'react';
import { CharacterData, Origine } from '../types';
import { getSpecData } from '../utils/specUtils';

type ComponentEntry = { label: string; value: number };
type StatValue = { value: number; details: { formula: string; components: ComponentEntry[]; total: number } };

export function useComputedStats(
    data: CharacterData,
    refs: any[],
    gameRules: any,
    equippedValues: Record<string, { value: number; components: any[] }>
) {
    const refsById = React.useMemo(() => {
        const map = new Map<number, any>();
        for (const r of refs) map.set(r.id, r);
        return map;
    }, [refs]);

    return React.useMemo(() => {
        const totals: Record<string, StatValue> = {
            solide: { value: 0, details: { formula: "Protections + Accessoires", components: [], total: 0 } },
            speciale: { value: 0, details: { formula: "Protections + Accessoires", components: [], total: 0 } },
            magique: { value: 0, details: { formula: "Protections + Accessoires", components: [], total: 0 } },
            discretion: { value: 0, details: { formula: "Adresse Naturelle + Objets", components: [], total: 0 } },
            magie_physique: { value: 0, details: { formula: "Moyenne sup. (Intelligence + Adresse) + Objets", components: [], total: 0 } },
            magie_psychique: { value: 0, details: { formula: "Moyenne sup. (Intelligence + Charisme) + Objets", components: [], total: 0 } },
            resistance_magique: { value: 0, details: { formula: "Moyenne sup. (Courage + Intelligence + Force) + Objets", components: [], total: 0 } },
            protection_pluie: { value: 0, details: { formula: "Protections + Accessoires", components: [], total: 0 } },
            protection_froid: { value: 0, details: { formula: "Protections + Accessoires", components: [], total: 0 } },
            protection_chaleur: { value: 0, details: { formula: "Protections + Accessoires", components: [], total: 0 } },
            marche: { value: 0, details: { formula: "Arrondi sup. (Vitesse Origine * Encombrement PR sol) + Objets", components: [], total: 0 } },
            course: { value: 0, details: { formula: "Arrondi sup. (Vitesse Origine * Encombrement PR sol) + Objets", components: [], total: 0 } }
        };

        // Discretion base
        const adrNat = (data.characteristics.adresse.naturel || 0);
        totals.discretion.value += adrNat;
        totals.discretion.details.components.push({ label: 'Adresse (Naturelle)', value: adrNat });

        // Magic bases
        const int = equippedValues.intelligence.value;
        const adr = equippedValues.adresse.value;
        const baseMagPhy = Math.ceil((int + adr) / 2);
        totals.magie_physique.value += baseMagPhy;
        totals.magie_physique.details.components.push({ label: `Moyenne sup. (INT ${int} + AD ${adr})`, value: baseMagPhy });

        const cha = equippedValues.charisme.value;
        const baseMagPsy = Math.ceil((int + cha) / 2);
        totals.magie_psychique.value += baseMagPsy;
        totals.magie_psychique.details.components.push({ label: `Moyenne sup. (INT ${int} + CHA ${cha})`, value: baseMagPsy });

        const cour = equippedValues.courage.value;
        const force = equippedValues.force.value;
        const baseResMag = Math.ceil((cour + int + force) / 3);
        totals.resistance_magique.value += baseResMag;
        totals.resistance_magique.details.components.push({ label: `Moyenne sup. (COU ${cour} + INT ${int} + FO ${force})`, value: baseResMag });

        // Inventory: protections, accessories
        data.inventory.forEach(item => {
            const type = item.equipement_type as string;
            if (['Protections', 'Accessoires'].includes(type)) {
                const refItem = refsById.get(item.refId);
                if (refItem?.details?.type === 'Bouclier' && !data.defenses.bouclier_actif) return;

                const protections = refItem?.protections || refItem?.raw?.protections || {};
                const baseSol = parseInt(String(protections.pr_sol || 0), 10);
                const baseSpe = parseInt(String(protections.pr_spe || 0), 10);
                const baseMag = parseInt(String(protections.pr_mag || 0), 10);

                // Environment
                const prots = refItem?.protections || refItem?.raw?.protections;
                if (prots) {
                    const valPluie = parseInt(String(prots.pluie || 0), 10);
                    const valFroid = parseInt(String(prots.froid || 0), 10);
                    const valChaleur = parseInt(String(prots.chaleur || 0), 10);
                    if (valPluie !== 0) {
                        totals.protection_pluie.value += valPluie;
                        totals.protection_pluie.details.components.push({ label: refItem?.nom || item.nom, value: valPluie });
                    }
                    if (valFroid !== 0) {
                        totals.protection_froid.value += valFroid;
                        totals.protection_froid.details.components.push({ label: refItem?.nom || item.nom, value: valFroid });
                    }
                    if (valChaleur !== 0) {
                        totals.protection_chaleur.value += valChaleur;
                        totals.protection_chaleur.details.components.push({ label: refItem?.nom || item.nom, value: valChaleur });
                    }
                }

                const modSol = parseInt(String(item.modif_pr_sol || 0), 10);
                const modSpe = parseInt(String(item.modif_pr_spe || 0), 10);
                const modMag = parseInt(String(item.modif_pr_mag || 0), 10);

                const valSol = baseSol + modSol;
                const valSpe = baseSpe + modSpe;
                const valMag = baseMag + modMag;

                if (valSol !== 0) {
                    totals.solide.value += valSol;
                    totals.solide.details.components.push({ label: refItem?.nom || item.nom, value: valSol });
                }
                if (valSpe !== 0) {
                    totals.speciale.value += valSpe;
                    totals.speciale.details.components.push({ label: refItem?.nom || item.nom, value: valSpe });
                }
                if (valMag !== 0) {
                    totals.magique.value += valMag;
                    totals.magique.details.components.push({ label: refItem?.nom || item.nom, value: valMag });
                }

                // Characteristics bonuses for discretion, magic, movement
                const caracs = refItem?.caracteristiques || refItem?.raw?.caracteristiques;
                if (caracs) {
                    const discKey = Object.keys(caracs).find(k => k.toLowerCase() === 'discretion' || k.toLowerCase() === 'discrétion');
                    if (discKey) {
                        const val = parseInt(String(caracs[discKey]), 10) || 0;
                        if (val !== 0) {
                            totals.discretion.value += val;
                            totals.discretion.details.components.push({ label: refItem?.nom || item.nom, value: val });
                        }
                    }

                    const magPhyKey = Object.keys(caracs).find(k => k.toLowerCase() === 'mag_phy' || k.toLowerCase() === 'magie_physique');
                    if (magPhyKey) {
                        const val = parseInt(String(caracs[magPhyKey]), 10) || 0;
                        if (val !== 0) {
                            totals.magie_physique.value += val;
                            totals.magie_physique.details.components.push({ label: refItem?.nom || item.nom, value: val });
                        }
                    }

                    const magPsyKey = Object.keys(caracs).find(k => k.toLowerCase() === 'mag_psy' || k.toLowerCase() === 'magie_psychique');
                    if (magPsyKey) {
                        const val = parseInt(String(caracs[magPsyKey]), 10) || 0;
                        if (val !== 0) {
                            totals.magie_psychique.value += val;
                            totals.magie_psychique.details.components.push({ label: refItem?.nom || item.nom, value: val });
                        }
                    }

                    const rmKey = Object.keys(caracs).find(k => k.toLowerCase() === 'rm' || k.toLowerCase() === 'resistance_magique' || k.toLowerCase() === 'résistance_magique');
                    if (rmKey) {
                        const val = parseInt(String(caracs[rmKey]), 10) || 0;
                        if (val !== 0) {
                            totals.resistance_magique.value += val;
                            totals.resistance_magique.details.components.push({ label: refItem?.nom || item.nom, value: val });
                        }
                    }

                    if (caracs.mvt) {
                        const val = parseInt(String(caracs.mvt), 10);
                        if (val !== 0) {
                            totals.marche.value += val;
                            totals.marche.details.components.push({ label: `${refItem?.nom || item.nom} (Mvt)`, value: val });
                            totals.course.value += val;
                            totals.course.details.components.push({ label: `${refItem?.nom || item.nom} (Mvt)`, value: val });
                        }
                    }

                    if (caracs.marche) {
                        const val = parseInt(String(caracs.marche), 10);
                        if (val !== 0) {
                            totals.marche.value += val;
                            totals.marche.details.components.push({ label: refItem?.nom || item.nom, value: val });
                        }
                    }

                    if (caracs.course) {
                        const val = parseInt(String(caracs.course), 10);
                        if (val !== 0) {
                            totals.course.value += val;
                            totals.course.details.components.push({ label: refItem?.nom || item.nom, value: val });
                        }
                    }
                }
            }
        });

        // Movement from origin
        if (gameRules && data.identity.origine) {
            const originObj = gameRules.origines.find((o: Origine) =>
                o.name_m === data.identity.origine || o.name_f === data.identity.origine
            );

            if (originObj) {
                const speed = originObj.vitesse;
                const prSolide = totals.solide.value + (data.defenses.solide.temp || 0);

                let marcheMult = 8;
                if (prSolide >= 2 && prSolide < 3) marcheMult = 6;
                else if (prSolide >= 3 && prSolide <= 5) marcheMult = 4;
                else if (prSolide === 6) marcheMult = 3;
                else if (prSolide === 7) marcheMult = 2;
                else if (prSolide > 7) marcheMult = 1;

                let courseMult = 12;
                if (prSolide >= 2 && prSolide < 3) courseMult = 10;
                else if (prSolide >= 3 && prSolide <= 4) courseMult = 8;
                else if (prSolide === 5) courseMult = 6;
                else if (prSolide === 6) courseMult = 4;
                else if (prSolide === 7) courseMult = 3;
                else if (prSolide > 7) courseMult = 2;

                const baseMarche = Math.ceil(speed * marcheMult / 100);
                totals.marche.value += baseMarche;
                totals.marche.details.components.push({
                    label: `Base origine: ${speed / 100} * (PR Sol ${prSolide} => x${marcheMult})`,
                    value: baseMarche
                });

                const baseCourse = Math.ceil(speed * courseMult / 100);
                totals.course.value += baseCourse;
                totals.course.details.components.push({
                    label: `Base origine: ${speed / 100} * (PR Sol ${prSolide} => x${courseMult})`,
                    value: baseCourse
                });

                // Spec bonuses for movement & RM
                const { specBonuses, subSpecBonuses } = getSpecData(gameRules, data.identity);

                if (specBonuses['RM']) {
                    totals.resistance_magique.value += specBonuses['RM'];
                    totals.resistance_magique.details.components.push({ label: 'Spécialisation', value: specBonuses['RM'] });
                }
                if (subSpecBonuses['RM']) {
                    totals.resistance_magique.value += subSpecBonuses['RM'];
                    totals.resistance_magique.details.components.push({ label: 'Sous-spécialisation', value: subSpecBonuses['RM'] });
                }

                if (specBonuses['MVTm']) {
                    totals.marche.value += specBonuses['MVTm'];
                    totals.marche.details.components.push({ label: 'Spécialisation', value: specBonuses['MVTm'] });
                }
                if (subSpecBonuses['MVTm']) {
                    totals.marche.value += subSpecBonuses['MVTm'];
                    totals.marche.details.components.push({ label: 'Sous-spécialisation', value: subSpecBonuses['MVTm'] });
                }

                if (specBonuses['MVTc']) {
                    totals.course.value += specBonuses['MVTc'];
                    totals.course.details.components.push({ label: 'Spécialisation', value: specBonuses['MVTc'] });
                }
                if (subSpecBonuses['MVTc']) {
                    totals.course.value += subSpecBonuses['MVTc'];
                    totals.course.details.components.push({ label: 'Sous-spécialisation', value: subSpecBonuses['MVTc'] });
                }
            }
        }

        // Set totals
        for (const key of Object.keys(totals)) {
            totals[key].details.total = totals[key].value;
        }

        return totals;
    }, [data.characteristics.adresse.naturel, equippedValues, data.inventory, data.defenses, gameRules, data.identity.origine, refsById]);
}
