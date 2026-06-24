import React from 'react';
import { Equipement, RefEquipement } from '../../../types';
import { SearchableSelect } from '../../Shared/SearchableSelect';
import { SmartInput } from '../../Shared/SmartInput';
import { EtatSelector } from '../../Shared/EtatSelector';
import { RuptureModifier } from '../../Shared/RuptureModifier';
import { calculateFinalRupture } from '../../../utils/sacUtils';
import { useEquipmentTable } from '../../../hooks/useEquipmentTable';

interface AccessoiresTableProps {
    items: Equipement[];
    onItemsChange: (items: Equipement[]) => void;
    referenceOptions: RefEquipement[];
    defaultItem?: Partial<Equipement>;
    onRemove?: (uid: string) => void;
}

export const AccessoiresTable: React.FC<AccessoiresTableProps> = React.memo(({ items, onItemsChange, referenceOptions, defaultItem, onRemove }) => {

    const { handleAddRow, handleRemoveRow, handleSelectChange, handleUpdateField, getRefValue, getRefItem } = useEquipmentTable(
        items, onItemsChange, referenceOptions, {
            equipementType: 'Accessoires',
            defaultFields: { modif_pi: 0, modif_rupture: 0, modif_pr_sol: 0, modif_pr_mag: 0, modif_pr_spe: 0, etat: 'Intact', ...defaultItem },
            resetFieldsOnClear: { modif_pr_sol: 0, modif_pr_spe: 0, modif_pr_mag: 0, modif_rupture: 0 },
            onRemove,
        }
    );

    const calculateTotalPr = (base: number | undefined, modif: number | undefined): string | number => {
        const baseVal = parseInt(String(base || 0), 10);
        const modifVal = parseInt(String(modif || 0), 10);
        const total = baseVal + modifVal;
        return total !== 0 ? total : '-';
    };

    return (
        <div className="mb-6 p-6 bg-parchment/30 rounded-lg shadow-sm border border-leather/20">
            <div className="flex justify-between items-center mb-4 border-b border-leather/20 pb-2">
                <h3 className="text-xl font-bold text-leather font-serif">Accessoires</h3>
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
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-sm font-serif font-bold text-leather uppercase tracking-wider border-b-2 border-leather">
                            <th className="p-2 w-12">ID</th>
                            <th className="p-2 w-24">Type</th>
                            <th className="p-2 w-48">Nom</th>

                            <th className="p-2 w-16 text-center">Pr Sol</th>
                            <th className="p-2 w-16 text-center">Mod</th>

                            <th className="p-2 w-16 text-center">Pr Spé</th>
                            <th className="p-2 w-16 text-center">Mod</th>

                            <th className="p-2 w-16 text-center">Pr Mag</th>
                            <th className="p-2 w-16 text-center">Mod</th>

                            <th className="p-2 w-28 text-center pt-2">Etat</th>

                            <th className="p-2 w-20 text-center">Rup</th>
                            <th className="p-2 w-16 text-center">Mod</th>

                            <th className="p-2">Effet</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="text-ink">
                        {items.map((item) => {
                            const refItem = getRefItem(item.refId);
                            const refRupture = getRefValue(item.refId, 'rupture');
                            const basePrSol = getRefValue(item.refId, 'pr_sol');
                            const basePrSpe = getRefValue(item.refId, 'pr_spe');
                            const basePrMag = getRefValue(item.refId, 'pr_mag');

                            return (
                                <tr key={item.uid} className="border-b border-leather-light/30 hover:bg-leather/5">
                                    <td className="p-2 text-xs text-ink-light">{getRefValue(item.refId, 'ref_id') || '-'}</td>
                                    <td className="p-2 text-sm italic">{getRefValue(item.refId, 'type') || item.equipement_type}</td>
                                    <td className="p-2 w-48 max-w-[12rem]" title={getRefValue(item.refId, 'effet')}>
                                        <SearchableSelect
                                            options={referenceOptions.map(r => ({ id: r.id, label: r.nom }))}
                                            value={item.refId}
                                            onChange={(val) => handleSelectChange(item.uid, val)}
                                            className="w-full"
                                            direction="up" // Force open upwards
                                        />
                                    </td>

                                    {/* PR Solide */}
                                    <td className="p-2 text-center">{calculateTotalPr(basePrSol, item.modif_pr_sol)}</td>
                                    <td className="p-2">
                                        <SmartInput
                                            type="text"
                                            value={item.modif_pr_sol || 0}
                                            onCommit={(val) => handleUpdateField(item.uid, 'modif_pr_sol', Number(val))}
                                            className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center"
                                            placeholder="+0"
                                        />
                                    </td>

                                    {/* PR Spéciale */}
                                    <td className="p-2 text-center">{calculateTotalPr(basePrSpe, item.modif_pr_spe)}</td>
                                    <td className="p-2">
                                        <SmartInput
                                            type="text"
                                            value={item.modif_pr_spe || 0}
                                            onCommit={(val) => handleUpdateField(item.uid, 'modif_pr_spe', Number(val))}
                                            className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center"
                                            placeholder="+0"
                                        />
                                    </td>

                                    {/* PR Magique */}
                                    <td className="p-2 text-center">{calculateTotalPr(basePrMag, item.modif_pr_mag)}</td>
                                    <td className="p-2">
                                        <SmartInput
                                            type="text"
                                            value={item.modif_pr_mag || 0}
                                            onCommit={(val) => handleUpdateField(item.uid, 'modif_pr_mag', Number(val))}
                                            className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center"
                                            placeholder="+0"
                                        />
                                    </td>

                                    {/* Etat */}
                                    <td className="p-2">
                                        <EtatSelector value={item.etat || 'Intact'} onChange={(val) => handleUpdateField(item.uid, 'etat', val)} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-sm text-center" />
                                    </td>
                                    <td className="p-2 text-center">
                                        {calculateFinalRupture(refRupture, item.modif_rupture)}
                                    </td>
                                    <td className="p-2">
                                        <RuptureModifier baseRupture={refRupture} modifier={item.modif_rupture || 0} onChange={(val) => handleUpdateField(item.uid, 'modif_rupture', val)} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center text-sm" />
                                    </td>

                                    {/* Effet */}
                                    <td className="p-2 text-sm max-w-[200px] truncate" title={refItem?.raw.details?.effet || ''}>
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
