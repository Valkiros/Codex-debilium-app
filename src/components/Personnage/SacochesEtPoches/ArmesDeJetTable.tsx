import React from 'react';
import { Equipement, RefEquipement } from '../../../types';
import { SearchableSelect } from '../../Shared/SearchableSelect';
import { SmartInput } from '../../Shared/SmartInput';
import { EtatSelector } from '../../Shared/EtatSelector';
import { RuptureModifier } from '../../Shared/RuptureModifier';
import { calculateFinalRupture } from '../../../utils/sacUtils';
import { useEquipmentTable } from '../../../hooks/useEquipmentTable';

interface ArmesDeJetTableProps {
    items: Equipement[];
    onItemsChange: (items: Equipement[]) => void;
    referenceOptions: RefEquipement[];
    characterForce: number;
}

export const ArmesDeJetTable: React.FC<ArmesDeJetTableProps> = ({ items, onItemsChange, referenceOptions, characterForce }) => {

    const { handleAddRow, handleRemoveRow, handleSelectChange, handleUpdateField, getRefValue, getRefItem } = useEquipmentTable(
        items, onItemsChange, referenceOptions, {
            equipementType: 'Armes_de_jet',
            defaultFields: { etat: 'Intact', modif_pi: 0, modif_rupture: 0, quantite: 1 },
            resetFieldsOnClear: { modif_pi: 0, modif_rupture: 0 },
        }
    );

    const calculateTotal = (dice: string, refPi: number, modif: number, bonusFo: number) => {
        const totalPi = (refPi || 0) + (modif || 0) + (bonusFo || 0);
        if (totalPi > 0) return `${dice} + ${totalPi}`;
        if (totalPi < 0) return `${dice} - ${Math.abs(totalPi)}`;
        return dice;
    };

    return (
        <div className="mb-6 p-4 bg-parchment/30 rounded border border-leather/20">
            <div className="flex justify-between items-center mb-2 border-b border-leather/20 pb-1">
                <h3 className="font-bold text-leather uppercase">Armes de Jet</h3>
                <button onClick={handleAddRow} className="px-2 py-0.5 bg-leather text-parchment rounded hover:bg-leather-dark transition-colors font-bold">+</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="text-xs font-bold text-leather uppercase tracking-wider border-b border-leather/20">
                            <th className="p-2 w-16 text-center">Qté</th>
                            <th className="p-2 w-48">Nom</th>
                            <th className="p-2 w-24">Dégâts</th>
                            <th className="p-2 w-16">Modif PI</th>
                            <th className="p-2 w-16">Bonus FO</th>
                            <th className="p-2 w-24">Total</th>
                            <th className="p-2 w-16">Portée</th>
                            <th className="p-2">Effet</th>
                            <th className="p-2 w-28 text-center">Etat</th>
                            <th className="p-2 w-16 text-center">Rupture</th>
                            <th className="p-2 w-16 text-center">Modif</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {items.map(item => {
                            const refItem = getRefItem(item.refId);
                            // Fix: Handle case where degats is an object {degats: "...", pi: ...} or string
                            let degatsStr = '-';
                            if (refItem?.degats) {
                                if (typeof refItem.degats === 'object') {
                                    // @ts-ignore
                                    degatsStr = refItem.degats.degats || '-';
                                } else {
                                    degatsStr = refItem.degats;
                                }
                            }
                            const refPi = refItem?.pi || 0;
                            // Bonus FO logic (Force Equipped - 12)
                            const bonusFo = Math.max(0, characterForce - 12);
                            const refRupture = refItem?.rupture || getRefValue(item.refId, 'details', 'rupture');

                            return (
                                <tr key={item.uid} className="border-b border-leather/10 hover:bg-leather/5">
                                    <td className="p-2">
                                        <SmartInput
                                            type="number"
                                            value={item.quantite || 1}
                                            onCommit={(val) => handleUpdateField(item.uid, 'quantite', Number(val))}
                                            className="w-full bg-input-bg text-ink border-b border-leather/20 text-center focus:border-leather outline-none"
                                        // min={1}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <SearchableSelect
                                            options={referenceOptions.map(r => ({ id: r.id, label: r.nom }))}
                                            value={item.refId}
                                            onChange={(val) => handleSelectChange(item.uid, val)}
                                            className="w-full"
                                        />
                                    </td>
                                    <td className="p-2 text-ink-light">
                                        {degatsStr} {refPi !== 0 ? `(${refPi > 0 ? '+' : ''}${refPi})` : ''}
                                    </td>
                                    <td className="p-2">
                                        <SmartInput
                                            type="number"
                                            value={item.modif_pi || 0}
                                            onCommit={(val) => handleUpdateField(item.uid, 'modif_pi', Number(val))}
                                            className="w-full bg-input-bg text-ink border-b border-leather/20 text-center focus:border-leather outline-none"
                                            placeholder="+0"
                                        />
                                    </td>
                                    <td className="p-2 text-center text-ink-light">
                                        {bonusFo > 0 ? `+${bonusFo}` : '0'}
                                    </td>
                                    <td className="p-2 font-bold text-leather">
                                        {calculateTotal(degatsStr, refPi, item.modif_pi || 0, bonusFo)}
                                    </td>
                                    <td className="p-2 text-center text-ink-light">
                                        {refItem?.portee || getRefValue(item.refId, 'details', 'portee') || '-'}
                                    </td>
                                    <td className="p-2 italic text-ink-light truncate max-w-[150px]" title={refItem?.effet || getRefValue(item.refId, 'details', 'effet')}>
                                        {refItem?.effet || getRefValue(item.refId, 'details', 'effet') || '-'}
                                    </td>
                                    <td className="p-2">
                                        <EtatSelector value={item.etat || 'Intact'} onChange={(val) => handleUpdateField(item.uid, 'etat', val)} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-sm text-center" />
                                    </td>
                                    <td className="p-2 text-center text-ink-light">
                                        {calculateFinalRupture(refRupture, item.modif_rupture)}
                                    </td>
                                    <td className="p-2">
                                        <RuptureModifier baseRupture={refRupture} modifier={item.modif_rupture || 0} onChange={(val) => handleUpdateField(item.uid, 'modif_rupture', val)} className="w-full bg-input-bg text-ink border-b border-leather/20 text-center focus:border-leather outline-none text-sm" />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => handleRemoveRow(item.uid)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
