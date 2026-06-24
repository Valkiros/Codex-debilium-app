import React, { useEffect, useState, forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';

import { invoke } from '@tauri-apps/api/core';
import { applyCompetenceRules } from "../../../utils/competenceRules";
import { CharacterHeader } from './CharacterHeader';

import { MovementPanel } from './MovementPanel';
import { ProtectionsPanel } from '../Equipements/ProtectionsPanel';
import { MagicStealthPanel } from './MagicStealthPanel';
import { CharacteristicsPanel } from './CharacteristicsPanel';
import { AdBonusModal } from './AdBonusModal';
import { TempModifiersPanel } from './TempModifiersPanel';
import { Inventory } from '../Equipements/Inventory';
import { CompetencesPanel } from '../Competences/CompetencesPanel';
import { SpecializationCompetencesPanel } from '../Competences/SpecializationCompetencesPanel';
import { DomainPanel } from '../Competences/DomainPanel';
import { StatusPanel } from '../Etat/StatusPanel';
import { SacochesEtPoches } from '../SacochesEtPoches/SacochesEtPoches';
import { SacPanel } from '../Sac/SacPanel';
import { Catalogue } from '../Catalogue/Catalogue';
import { APE } from '../APE/APE';
import { RichessePanel } from '../../Personnage/Richesse/RichessePanel';
import { MonturePanel } from '../Monture/MonturePanel';
import { FamilierPanel } from '../Familier/FamiliersPanel';
import { InvocationPanel } from '../Invocation/InvocationsPanel';
import { CharacterData, Mount, RichesseData } from '../../../types';
import { INITIAL_DATA } from '../../../constants';
import { useRefContext } from '../../../context/RefContext';
import { getAlcoholModifiers } from '../../../utils/alcohol';
import { useCharacterHistory } from '../../../hooks/useCharacterHistory';
import { useEquippedValues } from '../../../hooks/useEquippedValues';
import { useComputedStats } from '../../../hooks/useComputedStats';
import { GiScrollQuill, GiChestArmor, GiBelt, GiBackpack, GiHeartBeats, GiOpenBook, GiDna1, GiCoins, GiShop, GiHorseHead, GiWolfHead, GiGhost } from 'react-icons/gi';


export interface CharacterSheetHandle {
    save: () => Promise<void>;
    undo: () => void;
    redo: () => void;
}

interface CharacterSheetProps {
    characterId: string;
    onDirtyChange?: (isDirty: boolean) => void;
    visibleTabs: Record<string, boolean>;
}

export const CharacterSheet = forwardRef<CharacterSheetHandle, CharacterSheetProps>(({ characterId, onDirtyChange, visibleTabs }, ref) => {
    const [characterLoading, setCharacterLoading] = useState(true);
    const { refs, gameRules, loading: refLoading } = useRefContext();
    const [referenceCompetences, setReferenceCompetences] = useState<any[]>([]);

    const { data, setData, undo, redo, saveCharacter, initFromLoaded, isInitialLoad, showSaveToast } =
        useCharacterHistory(characterId, { onDirtyChange });

    useEffect(() => {
        invoke('get_competences')
            .then((comps: any) => setReferenceCompetences(comps))
            .catch(err => console.error("Failed to load competences:", err));
    }, []);

    useImperativeHandle(ref, () => ({
        save: saveCharacter,
        undo,
        redo
    }));

    useEffect(() => {
        if (!characterId) return;

        invoke<any>('get_personnage', { id: characterId })
            .then(char => {
                if (char && char.data) {
                    let inventory = char.data.inventory || [];

                    if (refs.length > 0 && inventory.length > 0) {
                        let changed = false;
                        inventory = inventory.map((item: any) => {
                            const matchById = refs.find(r => r.id === item.refId);
                            if (matchById) return item;

                            const matchByStableId = refs.find(r => r.ref_id === item.refId);
                            if (matchByStableId) {
                                changed = true;
                                return { ...item, refId: matchByStableId.id };
                            }

                            const oldName = item.nom;
                            if (oldName) {
                                const matchByName = refs.find(r => r.nom === oldName);
                                if (matchByName) {
                                    changed = true;
                                    return { ...item, refId: matchByName.id };
                                }
                            }
                            return item;
                        });

                        if (changed) {
                            console.log("Inventory IDs repaired.");
                        }
                    }

                    const mergedData = {
                        ...INITIAL_DATA,
                        ...char.data,
                        identity: { ...INITIAL_DATA.identity, ...(char.data.identity || {}) },
                        vitals: { ...INITIAL_DATA.vitals, ...(char.data.vitals || {}) },
                        general: { ...INITIAL_DATA.general, ...(char.data.general || {}) },
                        defenses: { ...INITIAL_DATA.defenses, ...(char.data.defenses || {}) },
                        movement: { ...INITIAL_DATA.movement, ...(char.data.movement || {}) },
                        magic: { ...INITIAL_DATA.magic, ...(char.data.magic || {}) },
                        characteristics: { ...INITIAL_DATA.characteristics, ...(char.data.characteristics || {}) },
                        temp_modifiers: { ...INITIAL_DATA.temp_modifiers, ...(char.data.temp_modifiers || {}) },
                        inventory: inventory,
                        competences: char.data.competences || [],
                        competences_specialisation: char.data.competences_specialisation || [],
                        competences_sous_specialisation: char.data.competences_sous_specialisation || []
                    };
                    initFromLoaded(mergedData);
                }
                setCharacterLoading(false);
                setTimeout(() => { isInitialLoad.current = false; }, 500);
            })
            .catch(err => {
                console.error("Failed to load character:", err);
                setCharacterLoading(false);
                isInitialLoad.current = false;
            });
    }, [characterId, refs]);

    type TabName = 'fiche' | 'equipement' | 'sacoches' | 'sac' | 'catalogue' | 'competences' | 'status' | 'ape' | 'richesse' | 'monture' | 'familiers' | 'invocations';
    const [activeTab, setActiveTab] = useState<TabName>('fiche');

    React.useEffect(() => {
        if (activeTab !== 'fiche' && visibleTabs[activeTab] === false) {
            setActiveTab('fiche');
        }
    }, [visibleTabs, activeTab]);
    const [showAdBonusModal, setShowAdBonusModal] = useState(false);

    useEffect(() => {
        const adNaturel = data.characteristics.adresse.naturel || 0;
        if (adNaturel > 12 && !data.general.bonus_ad_12) {
            setShowAdBonusModal(true);
        } else {
            setShowAdBonusModal(false);
        }
    }, [data.characteristics.adresse.naturel, data.general.bonus_ad_12]);

    const handleBonusChoice = (choice: 'AT' | 'PRD') => {
        const newGeneral = { ...data.general, bonus_ad_12: choice };
        setData({ ...data, general: newGeneral });
        setShowAdBonusModal(false);
    };

    const { equippedValues } = useEquippedValues(data, refs, gameRules);
    const computedStats = useComputedStats(data, refs, gameRules, equippedValues);

    const globalModifiers = useMemo(() => {
        const alc = getAlcoholModifiers(data.status || INITIAL_DATA.status);
        return {
            pi: (alc.leger.pi || 0) + (alc.fort.pi || 0) + (alc.gueule_de_bois.pi || 0)
        };
    }, [data.status]);

    const handleMovementChange = useCallback((movement: any) => {
        setData(prev => ({ ...prev, movement }));
    }, []);

    const handleMagicChange = useCallback((magic: any) => {
        setData(prev => ({ ...prev, magic }));
    }, []);

    const handleMalusTeteChange = useCallback((val: number) => {
        setData(prev => ({ ...prev, general: { ...prev.general, malus_tete: val } }));
    }, []);

    const handleMalus2emeAtChange = useCallback((val: number) => {
        setData(prev => ({ ...prev, general: { ...prev.general, malus_2eme_at: val } }));
    }, []);

    const handleDefenseChange = useCallback((defenses: any) => {
        setData(prev => ({ ...prev, defenses }));
    }, []);

    const handleCharacteristicsChange = useCallback((characteristics: any) => {
        setData(prev => ({ ...prev, characteristics }));
    }, []);

    const handleTempModifiersChange = useCallback((temp_modifiers: any) => {
        setData(prev => ({ ...prev, temp_modifiers }));
    }, []);


    if (characterLoading || refLoading) {
        return <div className="p-8 text-center text-leather">Chargement de la feuille de personnage...</div>;
    }

    return (
        <div className={activeTab === 'catalogue' ? "w-full h-screen flex flex-col p-4 md:p-8 pb-0" : "max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-20"}>
            <div className={activeTab === 'catalogue' ? 'hidden' : 'block'}>
                <CharacterHeader
                    characterData={data}
                    identity={data.identity}
                    vitals={data.vitals}
                    generalStats={data.general}
                    onIdentityChange={(newIdentity) => {
                        const updatedIdentity = { ...newIdentity };
                        const oldIdentity = data.identity;

                        let hasSpecChanged = false;
                        let hasSubSpecChanged = false;

                        if (!gameRules) {
                            hasSpecChanged = updatedIdentity.specialisation !== oldIdentity.specialisation;
                            hasSubSpecChanged = updatedIdentity.sous_specialisation !== oldIdentity.sous_specialisation;

                            if (updatedIdentity.metier !== oldIdentity.metier && !updatedIdentity.specialisation) {
                                updatedIdentity.specialisation = '';
                                updatedIdentity.sous_specialisation = '';
                                hasSpecChanged = true;
                                hasSubSpecChanged = true;
                            } else if (hasSpecChanged && !updatedIdentity.sous_specialisation) {
                                updatedIdentity.sous_specialisation = '';
                                hasSubSpecChanged = true;
                            }
                        } else {
                            const getMetierId = (name: string) => gameRules.metiers.find(m => m.name_m === name || m.name_f === name)?.id;

                            const getSpecId = (metierName: string, specName: string) => {
                                if (!specName) return undefined;
                                const m = gameRules.metiers.find(m => m.name_m === metierName || m.name_f === metierName);
                                return m?.specialisations?.find(s => s.name_m === specName || s.name_f === specName)?.id;
                            };

                            const getSubSpecId = (metierName: string, specName: string, subSpecName: string) => {
                                if (!subSpecName) return undefined;
                                const m = gameRules.metiers.find(m => m.name_m === metierName || m.name_f === metierName);
                                const s = m?.specialisations?.find(s => s.name_m === specName || s.name_f === specName);
                                return s?.sous_specialisations?.find(ss => ss.name_m === subSpecName || ss.name_f === subSpecName)?.id;
                            };

                            const oldMetierId = getMetierId(oldIdentity.metier);
                            const newMetierId = getMetierId(updatedIdentity.metier);

                            if (oldMetierId !== newMetierId) {
                                const isValidSpec = !!getSpecId(updatedIdentity.metier, updatedIdentity.specialisation || '');
                                if (!isValidSpec) {
                                    updatedIdentity.specialisation = '';
                                    updatedIdentity.sous_specialisation = '';
                                }
                            }

                            const oldSpecId = getSpecId(oldIdentity.metier, oldIdentity.specialisation || '');
                            const newSpecId = getSpecId(updatedIdentity.metier, updatedIdentity.specialisation || '');
                            hasSpecChanged = oldSpecId !== newSpecId;

                            if (hasSpecChanged) {
                                updatedIdentity.sous_specialisation = '';
                                hasSubSpecChanged = true;
                            } else {
                                const oldSubSpecId = getSubSpecId(oldIdentity.metier, oldIdentity.specialisation || '', oldIdentity.sous_specialisation || '');
                                const newSubSpecId = getSubSpecId(updatedIdentity.metier, updatedIdentity.specialisation || '', updatedIdentity.sous_specialisation || '');
                                hasSubSpecChanged = oldSubSpecId !== newSubSpecId;
                            }
                        }

                        let newCompetencesSpec = data.competences_specialisation;
                        let newCompetencesSubSpec = data.competences_sous_specialisation;

                        if (hasSpecChanged) {
                            newCompetencesSpec = [];
                            updatedIdentity.sous_specialisation = '';
                            newCompetencesSubSpec = [];
                        } else if (hasSubSpecChanged) {
                            newCompetencesSubSpec = [];
                        }

                        setData({
                            ...data,
                            identity: updatedIdentity,
                            competences_specialisation: newCompetencesSpec,
                            competences_sous_specialisation: newCompetencesSubSpec
                        });
                    }}
                    onVitalsChange={(vitals) => setData({ ...data, vitals })}
                    onGeneralChange={(general) => {
                        const xp = general.experience || 0;
                        const calculatedLevel = Math.floor((1 + Math.sqrt(1 + 4 * (xp / 50))) / 2);
                        const newLevel = Math.max(1, calculatedLevel);

                        setData({
                            ...data,
                            general: {
                                ...general,
                                niveau: newLevel
                            }
                        });
                    }}
                    competences={data.competences}
                />
            </div>

            {/* Tab Navigation */}
            <div className={`flex border-b-2 border-leather mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar ${activeTab === 'catalogue' ? 'flex-shrink-0' : ''}`}>
                <button
                    onClick={() => setActiveTab('fiche')}
                    title="Fiche"
                    className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'fiche' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                >
                    <GiScrollQuill className="w-8 h-8" />
                </button>
                {visibleTabs.equipement !== false && (
                    <button
                        onClick={() => setActiveTab('equipement')}
                        title="Equipements"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'equipement' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiChestArmor className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.sacoches !== false && (
                    <button
                        onClick={() => setActiveTab('sacoches')}
                        title="Sacoches & Poches"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'sacoches' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiBelt className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.sac !== false && (
                    <button
                        onClick={() => setActiveTab('sac')}
                        title="Sac"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'sac' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiBackpack className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.catalogue !== false && (
                    <button
                        onClick={() => setActiveTab('catalogue')}
                        title="Catalogue"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'catalogue' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiShop className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.status !== false && (
                    <button
                        onClick={() => setActiveTab('status')}
                        title="État"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'status' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiHeartBeats className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.competences !== false && (
                    <button
                        onClick={() => setActiveTab('competences')}
                        title="Compétences"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'competences' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiOpenBook className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.ape !== false && (
                    <button
                        onClick={() => setActiveTab('ape')}
                        title="APE"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'ape' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiDna1 className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.richesse !== false && (
                    <button
                        onClick={() => setActiveTab('richesse')}
                        title="Richesse"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'richesse' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiCoins className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.monture !== false && (
                    <button
                        onClick={() => setActiveTab('monture')}
                        title="Montures"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'monture' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiHorseHead className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.familiers !== false && (
                    <button
                        onClick={() => setActiveTab('familiers')}
                        title="Familiers"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'familiers' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiWolfHead className="w-8 h-8" />
                    </button>
                )}
                {visibleTabs.invocations !== false && (
                    <button
                        onClick={() => setActiveTab('invocations')}
                        title="Invocations"
                        className={`px-6 py-2 font-bold text-lg transition-colors ${activeTab === 'invocations' ? 'bg-leather text-parchment' : 'text-leather hover:bg-leather hover:text-parchment hover:bg-opacity-10'}`}
                    >
                        <GiGhost className="w-8 h-8" />
                    </button>
                )}
            </div>

            <div className={activeTab === 'fiche' ? 'space-y-6 animate-fade-in' : 'hidden'}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-6">
                        <MovementPanel
                            movement={data.movement}
                            magic={data.magic}
                            malusTete={data.general.malus_tete}
                            computedMovement={{
                                marche: computedStats.marche,
                                course: computedStats.course
                            }}
                            computedDiscretion={computedStats.discretion}
                            onMovementChange={handleMovementChange}
                            onMagicChange={handleMagicChange}
                            onMalusTeteChange={handleMalusTeteChange}
                            malus2emeAt={data.general.malus_2eme_at}
                            onMalus2emeAtChange={handleMalus2emeAtChange}
                        />
                    </div>
                    <div className="flex flex-col gap-6">
                        <ProtectionsPanel
                            defenses={data.defenses}
                            computedDefenses={{
                                solide: computedStats.solide,
                                speciale: computedStats.speciale,
                                magique: computedStats.magique
                            }}
                            onDefenseChange={handleDefenseChange}
                        />
                    </div>
                </div>

                <div>
                    <CharacteristicsPanel
                        characteristics={data.characteristics}
                        equippedValues={equippedValues}
                        inventory={data.inventory}
                        referenceOptions={refs}
                        onChange={handleCharacteristicsChange}
                        globalModifiers={globalModifiers}
                        malusTwo={data.general.malus_2eme_at}
                    />
                </div>

                <div>
                    <MagicStealthPanel
                        stats={data.magic}
                        computedMagic={{
                            magie_physique: computedStats.magie_physique,
                            magie_psychique: computedStats.magie_psychique,
                            resistance_magique: computedStats.resistance_magique,
                            protection_pluie: computedStats.protection_pluie,
                            protection_froid: computedStats.protection_froid,
                            protection_chaleur: computedStats.protection_chaleur
                        }}
                        onChange={handleMagicChange}
                    />
                </div>

                <TempModifiersPanel
                    modifiers={data.temp_modifiers}
                    onChange={handleTempModifiersChange}
                />
            </div>

            <div className={activeTab === 'equipement' ? 'animate-fade-in' : 'hidden'}>
                <Inventory
                    inventory={data.inventory}
                    onInventoryChange={(inventory) => setData({ ...data, inventory })}
                    characterForce={equippedValues.force.value}
                    bouclierActif={data.defenses.bouclier_actif}
                />
            </div>

            <div className={activeTab === 'sacoches' ? 'animate-fade-in' : 'hidden'}>
                <SacochesEtPoches
                    inventory={data.inventory}
                    onInventoryChange={(inventory) => setData({ ...data, inventory })}
                    characterForce={equippedValues.force.value}
                />
            </div>

            <div className={activeTab === 'sac' ? 'animate-fade-in' : 'hidden'}>
                <SacPanel
                    inventory={data.inventory}
                    onInventoryChange={(inventory) => setData({ ...data, inventory })}
                    customItems={data.custom_sac_items}
                    onCustomItemsChange={(custom_sac_items) => setData({ ...data, custom_sac_items })}
                />
            </div>

            <div className={activeTab === 'catalogue' ? 'animate-fade-in flex-1 overflow-hidden flex flex-col min-h-0' : 'hidden'}>
                <Catalogue
                    items={data.catalogue || []}
                    onItemsChange={(catalogueItems) => {
                        setData((prev: CharacterData) => ({ ...prev, catalogue: catalogueItems }));
                        onDirtyChange?.(true);
                    }}
                    isGlobalCondensed={data.catalogue_is_global_condensed || false}
                    onIsGlobalCondensedChange={(condensed) => {
                        setData((prev: CharacterData) => ({ ...prev, catalogue_is_global_condensed: condensed }));
                        onDirtyChange?.(true);
                    }}
                />
            </div>

            <div className={activeTab === 'competences' ? 'animate-fade-in' : 'hidden'}>
                <CompetencesPanel
                    title="Compétences origine et métier"
                    competences={data.competences || []}
                    onCompetencesChange={(newCompetences) => {
                        const processed = applyCompetenceRules(newCompetences, data, gameRules, referenceCompetences);
                        setData({ ...data, competences: processed });
                    }}
                />

                {data.identity.specialisation && (
                    <SpecializationCompetencesPanel
                        title={`Spécialisation : ${data.identity.specialisation}`}
                        competences={data.competences_specialisation || []}
                        onCompetencesChange={(newComps) => setData({ ...data, competences_specialisation: newComps })}
                        identity={data.identity}
                        type="specialisation"
                        globalCompetences={data.competences || []}
                    />
                )}

                {data.identity.sous_specialisation && (
                    <SpecializationCompetencesPanel
                        title={`Sous-Spécialisation : ${data.identity.sous_specialisation}`}
                        competences={data.competences_sous_specialisation || []}
                        onCompetencesChange={(newComps) => setData({ ...data, competences_sous_specialisation: newComps })}
                        identity={data.identity}
                        type="sous_specialisation"
                        globalCompetences={data.competences || []}
                    />
                )}

                {gameRules && data.identity.metier && data.identity.specialisation && data.identity.sous_specialisation && (() => {
                    const currentMetier = gameRules.metiers.find(m => m.name_m === data.identity.metier || m.name_f === data.identity.metier);
                    const spec = currentMetier?.specialisations?.find(s => s.name_m === data.identity.specialisation || s.name_f === data.identity.specialisation);
                    const subSpec = spec?.sous_specialisations?.find(s => s.name_m === data.identity.sous_specialisation || s.name_f === data.identity.sous_specialisation);

                    return subSpec?.id === 'preux_chevalier';
                })() && (
                        <DomainPanel
                            domaines={gameRules.domaines || []}
                            selectedDomaine={data.identity.domaine}
                            onDomaineChange={(dom) => setData({ ...data, identity: { ...data.identity, domaine: dom } })}
                        />
                    )}
            </div>

            <div className={activeTab === 'status' ? 'animate-fade-in' : 'hidden'}>
                <StatusPanel
                    status={data.status || INITIAL_DATA.status}
                    description={data.identity.description}
                    onChange={(newStatus) => setData({ ...data, status: newStatus })}
                    onDescriptionChange={(desc) => setData({ ...data, identity: { ...data.identity, description: desc } })}
                />
            </div>

            <div className={activeTab === 'ape' ? 'animate-fade-in' : 'hidden'}>
                <APE
                    ape={data.ape || []}
                    onApeChange={(ape) => setData({ ...data, ape })}
                    origin={data.identity.origine}
                />
            </div>

            {visibleTabs.richesse !== false && (
                <div className={activeTab === 'richesse' ? 'animate-fade-in' : 'hidden'}>
                    <RichessePanel
                        richesse={data.richesse || INITIAL_DATA.richesse}
                        onChange={(richesse: RichesseData) => setData({ ...data, richesse })}
                    />
                </div>
            )}

            {visibleTabs.monture !== false && (
                <div className={activeTab === 'monture' ? 'animate-fade-in' : 'hidden'}>
                    <MonturePanel
                        mounts={data.mounts || []}
                        onMountsChange={(newMounts) => setData({ ...data, mounts: newMounts })}
                    />
                </div>
            )}

            {visibleTabs.familiers !== false && (
                <div className={activeTab === 'familiers' ? 'animate-fade-in' : 'hidden'}>
                    <FamilierPanel
                        familiers={data.familiers || []}
                        onFamiliersChange={(newFamiliers: Mount[]) => setData({ ...data, familiers: newFamiliers })}
                    />
                </div>
            )}

            {visibleTabs.invocations !== false && (
                <div className={activeTab === 'invocations' ? 'animate-fade-in' : 'hidden'}>
                    <InvocationPanel
                        invocations={data.invocations || []}
                        onInvocationsChange={(newInvocations: Mount[]) => setData({ ...data, invocations: newInvocations })}
                    />
                </div>
            )}

            <div
                className={`fixed bottom-8 right-8 bg-leather border border-parchment text-parchment px-6 py-3 rounded-lg shadow-xl font-bold font-sans transition-all duration-300 z-50 flex items-center gap-3 ${showSaveToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
            >
                <GiScrollQuill className="w-6 h-6" />
                <span>Sauvegarde effectuée !</span>
            </div>

            <AdBonusModal
                isOpen={showAdBonusModal}
                onChoose={handleBonusChoice}
            />
        </div>
    );
});

CharacterSheet.displayName = 'CharacterSheet';
