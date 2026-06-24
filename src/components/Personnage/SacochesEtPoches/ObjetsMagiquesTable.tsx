import React from 'react';
import { Equipement, RefEquipement } from '../../../types';
import { SearchableSelect } from '../../Shared/SearchableSelect';
import { SmartInput } from '../../Shared/SmartInput';
import { useEquipmentTable } from '../../../hooks/useEquipmentTable';

interface ObjetsMagiquesTableProps {
    items: Equipement[];
    onItemsChange: (items: Equipement[]) => void;
    referenceOptions: RefEquipement[];
}

export const ObjetsMagiquesTable: React.FC<ObjetsMagiquesTableProps> = ({ items, onItemsChange, referenceOptions }) => {

    const { handleAddRow, handleRemoveRow, handleSelectChange, handleUpdateField, getRefValue, getRefItem } = useEquipmentTable(
        items, onItemsChange, referenceOptions, {
            equipementType: 'Objets_magiques',
            // @ts-ignore
            defaultFields: { quantite: undefined },
            resetFieldsOnClear: {},
        }
    );

    return (
        <div className="mb-6 p-4 bg-parchment/30 rounded border border-leather/20">
            <div className="flex justify-between items-center mb-2 border-b border-leather/20 pb-1">
                <h3 className="font-bold text-leather uppercase">Objets Magiques</h3>
                <button onClick={handleAddRow} className="px-2 py-0.5 bg-leather text-parchment rounded hover:bg-leather-dark transition-colors font-bold">+</button>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs font-bold text-leather uppercase tracking-wider border-b border-leather/20">
                        <th className="p-2 w-20 text-center">Charges</th>
                        <th className="p-2 w-1/3">Nom</th>
                        <th className="p-2 text-left">Effet</th>
                        <th className="p-2 w-8"></th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {items.map(item => {
                        const refItem = getRefItem(item.refId);
                        return (
                            <tr key={item.uid} className="border-b border-leather/10 hover:bg-leather/5">
                                <td className="p-2">
                                    <div className="flex items-center justify-center gap-1">
                                        <SmartInput
                                            type="number"
                                            // @ts-ignore
                                            value={item.quantite ?? ''}
                                            onCommit={(val) => handleUpdateField(item.uid, 'quantite', val === '' ? undefined : Number(val))}
                                            className="w-[25px] bg-input-bg text-ink border-b border-leather/20 text-center focus:border-leather outline-none font-bold text-ink"
                                            placeholder="0"
                                        />
                                        <span className="text-ink-light">
                                            {(() => {
                                                const maxCharges =
                                                    (refItem as any)?.details?.charge;
                                                return maxCharges ? `/ ${maxCharges}` : '';
                                            })()}
                                        </span>
                                    </div>
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
