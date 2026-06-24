import React from 'react';
import { Equipement, RefEquipement } from '../../../types';
import { SearchableSelect } from '../../Shared/SearchableSelect';
import { SmartInput } from '../../Shared/SmartInput';
import { EtatSelector } from '../../Shared/EtatSelector';
import { RuptureModifier } from '../../Shared/RuptureModifier';
import { calculateFinalRupture } from '../../../utils/sacUtils';
import { useEquipmentTable } from '../../../hooks/useEquipmentTable';

interface OutilsTableProps {
    items: Equipement[];
    onItemsChange: (items: Equipement[]) => void;
    referenceOptions: RefEquipement[];
}

export const OutilsTable: React.FC<OutilsTableProps> = ({ items, onItemsChange, referenceOptions }) => {

    const { handleAddRow, handleRemoveRow, handleSelectChange, handleUpdateField, getRefValue, getRefItem } = useEquipmentTable(
        items, onItemsChange, referenceOptions, {
            equipementType: 'Outils',
            // @ts-ignore
            defaultFields: { etat: 'Intact', modif_rupture: 0, quantite: undefined },
            resetFieldsOnClear: { modif_rupture: 0 },
        }
    );

    return (
        <div className="mb-6 p-4 bg-parchment/30 rounded border border-leather/20">
            <div className="flex justify-between items-center mb-2 border-b border-leather/20 pb-1">
                <h3 className="font-bold text-leather uppercase">Outils</h3>
                <button onClick={handleAddRow} className="px-2 py-0.5 bg-leather text-parchment rounded hover:bg-leather-dark transition-colors font-bold">+</button>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs font-bold text-leather uppercase tracking-wider border-b border-leather/20">
                        <th className="p-2 w-16 text-center">Qté</th>
                        <th className="p-2 w-1/3">Nom</th>
                        <th className="p-2 text-left">Effet</th>
                        <th className="p-2 w-28 text-center">Etat</th>
                        <th className="p-2 w-16 text-center">Rupture</th>
                        <th className="p-2 w-16 text-center">Modif</th>
                        <th className="p-2 w-8"></th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {items.map(item => {
                        const refItem = getRefItem(item.refId);
                        const refRupture = refItem?.rupture || getRefValue(item.refId, 'details', 'rupture');
                        return (
                            <tr key={item.uid} className="border-b border-leather/10 hover:bg-leather/5">
                                <td className="p-2">
                                    <SmartInput
                                        type="number"
                                        // @ts-ignore
                                        value={item.quantite ?? ''}
                                        onCommit={(val) => handleUpdateField(item.uid, 'quantite', val === '' ? undefined : Number(val))}
                                        className="w-full bg-input-bg text-ink border-b border-leather/20 text-center focus:border-leather outline-none font-bold"
                                        placeholder="0"
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
                                <td className="p-2 italic text-ink-light truncate max-w-[200px]" title={refItem?.effet || getRefValue(item.refId, 'details', 'effet')}>
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
    );
};
