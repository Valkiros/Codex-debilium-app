import { SmartInput } from '../../Shared/SmartInput';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { Mount } from '../../../types';

export interface CreaturePanelConfig {
    title: string;
    subtitle: string;
    defaultName: string;
    deleteTitle: string;
    deleteMessage: string;
    emptyMessage: string;
}

interface CreaturePanelProps {
    items: Mount[];
    onItemsChange: (newItems: Mount[]) => void;
    config: CreaturePanelConfig;
}

const EMPTY_CREATURE: Omit<Mount, 'uid'> = {
    nom: '',
    pv_current: 20,
    pv_max: 20,
    courage: 0,
    intelligence: 0,
    charisme: 0,
    adresse: 0,
    force: 0,
    esquive: 0,
    perception: 0,
    attaque: 0,
    parade: 0,
    rm: 0,
    mvt_marche: 0,
    mvt_course: 0,
    mvt_voyage: 0,
    prix: '',
    entretien: '',
    description: '',
    competences: '',
    bonus_cavalier: '',
    lieux: '',
    charge_max: '',
    at_speciales: ''
};

const STATS = [
    { key: 'courage', label: 'COU' },
    { key: 'intelligence', label: 'INT' },
    { key: 'charisme', label: 'CHA' },
    { key: 'adresse', label: 'AD' },
    { key: 'force', label: 'FO' },
    { key: 'esquive', label: 'ES' },
    { key: 'perception', label: 'PER' },
    { key: 'attaque', label: 'AT' },
    { key: 'parade', label: 'PRD' },
    { key: 'rm', label: 'RM' },
] as const;

export const CreaturePanel: React.FC<CreaturePanelProps> = ({ items = [], onItemsChange, config }) => {
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleAdd = () => {
        onItemsChange([...items, { ...EMPTY_CREATURE, nom: config.defaultName, uid: uuidv4() }]);
    };

    const handleRemove = (uid: string) => {
        setItemToDelete(uid);
    };

    const confirmRemove = () => {
        if (itemToDelete) {
            onItemsChange(items.filter(m => m.uid !== itemToDelete));
            setItemToDelete(null);
        }
    };

    const handleChange = (uid: string, field: keyof Mount, value: any) => {
        onItemsChange(items.map(m => m.uid === uid ? { ...m, [field]: value } : m));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-parchment/60 p-4 border border-leather/20 rounded shadow-sm">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-leather capitalize">{config.title}</h2>
                    <p className="text-sm text-ink-light italic">{config.subtitle}</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-leather text-parchment font-bold rounded hover:bg-leather-light transition-colors shadow-sm"
                    title="Ajouter"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter
                </button>
            </div>

            {items.length === 0 ? (
                <div className="text-center p-8 bg-parchment/30 border border-leather/20 rounded-lg text-ink-light font-serif italic">
                    {config.emptyMessage}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {items.map((item) => (
                        <div key={item.uid} className="bg-parchment/60 p-4 rounded-lg border border-leather/30 shadow-sm relative">
                            <button
                                onClick={() => handleRemove(item.uid)}
                                className="absolute top-4 right-4 text-red-700/60 hover:text-red-700 hover:bg-red-100/50 p-1.5 rounded transition-colors"
                                title="Supprimer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="space-y-4 lg:col-span-1">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Nom</label>
                                        <SmartInput
                                            type="text"
                                            value={item.nom}
                                            onCommit={(val) => handleChange(item.uid, 'nom', val)}
                                            className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-leather-dark font-serif font-bold focus:border-leather outline-none transition-colors"
                                            placeholder="Nom"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-red-900/10 p-3 rounded-lg border border-red-900/20">
                                            <div className="text-center font-bold text-red-800 text-sm mb-2 font-serif uppercase tracking-wider">Points de Vie</div>
                                            <div className="flex items-center justify-center gap-2">
                                                <SmartInput
                                                    type="number"
                                                    value={item.pv_current}
                                                    onCommit={(val) => handleChange(item.uid, 'pv_current', val)}
                                                    className="w-16 bg-white/50 border border-red-900/30 rounded p-1 text-center font-bold text-red-900 text-lg outline-none focus:border-red-900 focus:bg-white transition-colors"
                                                />
                                                <span className="text-red-900/50 font-bold text-xl">/</span>
                                                <SmartInput
                                                    type="number"
                                                    value={item.pv_max}
                                                    onCommit={(val) => handleChange(item.uid, 'pv_max', val)}
                                                    className="w-16 bg-white/50 border border-red-900/30 rounded p-1 text-center font-bold text-red-900 text-lg outline-none focus:border-red-900 focus:bg-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Prix</label>
                                            <SmartInput
                                                type="text"
                                                value={item.prix}
                                                onCommit={(val) => handleChange(item.uid, 'prix', val)}
                                                className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-leather-dark focus:border-leather outline-none text-sm"
                                                placeholder="Ex: 5 PO"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Entretien</label>
                                            <SmartInput
                                                type="text"
                                                value={item.entretien}
                                                onCommit={(val) => handleChange(item.uid, 'entretien', val)}
                                                className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-leather-dark focus:border-leather outline-none text-sm"
                                                placeholder="Ex: 1 PA / jour"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Mvt Marche</label>
                                            <SmartInput
                                                type="number"
                                                value={item.mvt_marche}
                                                onCommit={(val) => handleChange(item.uid, 'mvt_marche', val)}
                                                className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-center text-leather-dark font-bold focus:border-leather outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Mvt Course</label>
                                            <SmartInput
                                                type="number"
                                                value={item.mvt_course}
                                                onCommit={(val) => handleChange(item.uid, 'mvt_course', val)}
                                                className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-center text-leather-dark font-bold focus:border-leather outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Mvt Voyage (par jour)</label>
                                        <SmartInput
                                            type="number"
                                            value={item.mvt_voyage}
                                            onCommit={(val) => handleChange(item.uid, 'mvt_voyage', val)}
                                            className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-center text-leather-dark font-bold focus:border-leather outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Lieux où il se trouve</label>
                                        <SmartInput
                                            type="text"
                                            value={item.lieux}
                                            onCommit={(val) => handleChange(item.uid, 'lieux', val)}
                                            className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-leather-dark text-sm focus:border-leather outline-none"
                                            placeholder="Ex: Écurie de la ville"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Charge max.</label>
                                            <SmartInput
                                                type="text"
                                                value={item.charge_max}
                                                onCommit={(val) => handleChange(item.uid, 'charge_max', val)}
                                                className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-leather-dark focus:border-leather outline-none text-sm"
                                                placeholder="Ex: 150 kg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Bonus Cavalier</label>
                                            <SmartInput
                                                type="text"
                                                value={item.bonus_cavalier}
                                                onCommit={(val) => handleChange(item.uid, 'bonus_cavalier', val)}
                                                className="w-full bg-input-bg border border-leather/30 rounded px-3 py-2 text-leather-dark focus:border-leather outline-none text-sm"
                                                placeholder="Ex: +1 AT"
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="space-y-4 lg:col-span-2">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-leather/70 mb-2">Caractéristiques</label>
                                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                            {STATS.map((stat) => (
                                                <div key={stat.key} className="flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-leather uppercase">{stat.label}</span>
                                                    <SmartInput
                                                        type="number"
                                                        value={item[stat.key as keyof Mount]}
                                                        onCommit={(val) => handleChange(item.uid, stat.key as keyof Mount, val)}
                                                        className="w-full mt-1 bg-input-bg border border-leather/30 rounded p-1 text-center font-bold text-leather-dark outline-none focus:border-leather"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Description</label>
                                            <SmartInput
                                                type="textarea"
                                                value={item.description}
                                                onCommit={(val) => handleChange(item.uid, 'description', val)}
                                                className="w-full h-32 bg-input-bg border border-leather/30 rounded p-3 text-leather-dark text-sm focus:border-leather outline-none resize-none"
                                                placeholder="Description physique, tempérament..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Compétences</label>
                                            <SmartInput
                                                type="textarea"
                                                value={item.competences}
                                                onCommit={(val) => handleChange(item.uid, 'competences', val)}
                                                className="w-full h-32 bg-input-bg border border-leather/30 rounded p-3 text-leather-dark text-sm focus:border-leather outline-none resize-none"
                                                placeholder="Aptitudes diverses..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-leather/70 mb-1">Attaques Spéciales</label>
                                            <SmartInput
                                                type="textarea"
                                                value={item.at_speciales}
                                                onCommit={(val) => handleChange(item.uid, 'at_speciales', val)}
                                                className="w-full h-32 bg-input-bg border border-leather/30 rounded p-3 text-leather-dark text-sm focus:border-leather outline-none resize-none"
                                                placeholder="Dégâts, attaques..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {itemToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-parchment rounded-xl shadow-2xl p-6 max-w-sm w-full border-2 border-leather/30 text-center space-y-4">
                        <div className="flex justify-center mb-2">
                            <div className="bg-red-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-leather-dark">{config.deleteTitle}</h3>
                        <p className="text-ink-light text-sm">{config.deleteMessage}</p>
                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="px-4 py-2 bg-parchment-dark hover:bg-parchment-dark/80 text-leather-dark rounded font-bold transition-colors border border-leather/20"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmRemove}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors shadow-sm"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
