import React from 'react';
import { Equipement, RefEquipement } from '../../../types';
import { SearchableSelect } from '../../Shared/SearchableSelect';
import { SmartInput } from '../../Shared/SmartInput';
import { EtatSelector } from '../../Shared/EtatSelector';
import { RuptureModifier } from '../../Shared/RuptureModifier';
import { calculateFinalRupture } from '../../../utils/sacUtils';
import { useEquipmentTable } from '../../../hooks/useEquipmentTable';

interface MainsNuesTableProps {
    items: Equipement[];
    onItemsChange: (items: Equipement[]) => void;
    referenceOptions: RefEquipement[];
    defaultItem?: Partial<Equipement>;
    characterForce: number;
    onRemove?: (uid: string) => void;
}

export const MainsNuesTable: React.FC<MainsNuesTableProps> = React.memo(({ items, onItemsChange, referenceOptions, defaultItem, characterForce, onRemove }) => {

    const { handleAddRow, handleRemoveRow, handleSelectChange, handleUpdateField, getRefValue, getRefItem } = useEquipmentTable(
        items, onItemsChange, referenceOptions, {
            equipementType: 'MainsNues',
            defaultFields: { modif_pi: 0, modif_rupture: 0, modif_pr_sol: 0, modif_pr_mag: 0, modif_pr_spe: 0, etat: 'Intact', ...defaultItem },
            resetFieldsOnClear: { modif_pi: 0, modif_rupture: 0 },
            onRemove,
        }
    );

    const calculateTotal = (degats: string, refPi: number, modif: number, bonusFo: number): string => {
        if (!degats) return '';

        // 1. Separate Dice from Degats (ignoring internal bonuses as we now have explicit PI)
        let dicePart = degats;

        // 2. Parse modif_pi
        let modifVal = 0;
        if (modif) {
            const parsedModif = modif;
            if (!isNaN(parsedModif)) {
                modifVal = parsedModif;
            }
        }

        // 3. Calculate Total PI
        const totalPi = parseInt(String(refPi || 0), 10) + modifVal + (bonusFo || 0);

        // 4. Format
        if (totalPi > 0) {
            return `${dicePart} + ${totalPi}`;
        } else if (totalPi < 0) {
            return `${dicePart} - ${Math.abs(totalPi)}`;
        }
        return dicePart;
    };

    return (
        <div className="mb-6 p-6 bg-parchment/30 rounded-lg shadow-sm border border-leather/20">
            <div className="flex justify-between items-center mb-4 border-b border-leather/20 pb-2">
                <h3 className="text-xl font-bold text-leather font-serif">Mains Nues</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddRow}
                        className="px-3 py-1 bg-leather text-parchment font-serif font-bold rounded hover:bg-leather-dark active:scale-95 transition-all shadow-sm"
                        title="Ajouter une ligne"
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="text-sm font-serif font-bold text-leather uppercase tracking-wider border-b-2 border-leather">
                            <th className="p-2 w-16">N°</th>
                            <th className="p-2 w-16">ID</th>
                            <th className="p-2 w-24">Type</th>
                            <th className="p-2 w-48">Nom</th>
                            <th className="p-2 w-24">Dégâts</th>
                            <th className="p-2 w-20">Mod</th>
                            <th className="p-2 w-20">Bonus FO</th>
                            <th className="p-2 w-32">Total</th>
                            <th className="p-2 w-28">Etat</th>
                            <th className="p-2 w-24">Rup</th>
                            <th className="p-2 w-20">Mod</th>
                            <th className="p-2">Effet</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="text-ink">
                        {items.map((item, index) => {
                            const refItem = getRefItem(item.refId);
                            const refRupture = getRefValue(item.refId, 'rupture');

                            return (
                                <tr key={item.uid || index} className="border-b border-leather-light/30 hover:bg-leather/5">
                                    <td className="p-2 font-bold text-leather-dark">M{index + 1}</td>
                                    {/* Display Ref ID */}
                                    <td className="p-2 text-xs text-ink-light">{getRefValue(item.refId, 'ref_id') || '-'}</td>
                                    <td className="p-2 text-sm italic">{(() => {
                                        return refItem?.type || refItem?.category || item.equipement_type;
                                    })()}</td>
                                    <td className="p-2 w-48 max-w-[12rem]">
                                        <SearchableSelect
                                            options={referenceOptions.map(r => ({ id: r.id, label: r.nom }))}
                                            value={item.refId}
                                            onChange={(val) => handleSelectChange(item.uid, val)}
                                            className="w-full"
                                        />
                                    </td>
                                    <td className="p-2">
                                        {/* Display Dice + Base PI (e.g. "1D + 3") */}
                                        {(() => {
                                            const pi = refItem?.pi || 0;
                                            const dice = refItem?.degats || '';

                                            if (pi > 0 && dice) return `${dice} + ${pi}`;
                                            if (pi < 0 && dice) return `${dice} - ${Math.abs(pi)}`;
                                            if (pi !== 0 && !dice) return `${pi}`;
                                            return dice;
                                        })()}
                                    </td>
                                    <td className="p-2">
                                        <SmartInput
                                            type="number"
                                            value={item.modif_pi || 0}
                                            onCommit={(val) => handleUpdateField(item.uid, 'modif_pi', Number(val))}
                                            className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center"
                                            placeholder="+0"
                                        />
                                    </td>
                                    <td className="p-2 text-center text-ink-light font-mono">
                                        {(() => {
                                            const itemForceBonus = parseInt(String(refItem?.raw.caracteristiques?.force || 0), 10);
                                            const totalForce = parseInt(String(characterForce), 10) + itemForceBonus;
                                            const bonusFo = Math.max(0, totalForce - 12);
                                            return bonusFo > 0 ? `+${bonusFo}` : '0';
                                        })()}
                                    </td>
                                    <td className="p-2 font-bold text-leather">
                                        {(() => {
                                            const degats = refItem?.degats || '';
                                            const refPi = refItem?.pi || 0;

                                            const itemForceBonus = parseInt(String(refItem?.raw.caracteristiques?.force || 0), 10);
                                            const totalForce = parseInt(String(characterForce), 10) + itemForceBonus;
                                            const bonusFo = Math.max(0, totalForce - 12);

                                            return calculateTotal(degats, refPi, (item.modif_pi || 0), bonusFo);
                                        })()}
                                    </td>
                                    <td className="p-2">
                                        <EtatSelector value={item.etat || 'Intact'} onChange={(val) => handleUpdateField(item.uid, 'etat', val)} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-sm" />
                                    </td>
                                    <td className="p-2">
                                        {calculateFinalRupture(refRupture, item.modif_rupture)}
                                    </td>
                                    <td className="p-2">
                                        <RuptureModifier baseRupture={refRupture} modifier={item.modif_rupture || 0} onChange={(val) => handleUpdateField(item.uid, 'modif_rupture', val)} className="w-full bg-input-bg text-ink border-b border-leather/20 text-center focus:border-leather outline-none text-sm" />
                                    </td>
                                    <td className="p-2 text-sm max-w-[150px] truncate" title={refItem?.raw.details?.effet || ''}>
                                        {refItem?.raw.details?.effet || ''}
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleRemoveRow(item.uid)}
                                            className="text-red-600 hover:text-red-800 font-bold"
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
