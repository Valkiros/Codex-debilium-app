import React from 'react';
import { Equipement, RefEquipement } from '../../../types';
import { SearchableSelect } from '../../Shared/SearchableSelect';
import { SmartInput } from '../../Shared/SmartInput';
import { EtatSelector } from '../../Shared/EtatSelector';
import { RuptureModifier } from '../../Shared/RuptureModifier';
import { calculateFinalRupture } from '../../../utils/sacUtils';
import { Tooltip } from '../../Shared/Tooltip';
import { useEquipmentTable } from '../../../hooks/useEquipmentTable';

interface ProtectionsTableProps {
    items: Equipement[];
    onItemsChange: (items: Equipement[]) => void;
    referenceOptions: RefEquipement[];
    defaultItem?: Partial<Equipement>;
    bouclierActif: boolean;
    onRemove?: (uid: string) => void;
}

export const ProtectionsTable: React.FC<ProtectionsTableProps> = React.memo(({ items, onItemsChange, referenceOptions, defaultItem, bouclierActif, onRemove }) => {
    const { handleAddRow, handleRemoveRow, handleSelectChange, handleUpdateField, getRefValue, getRefItem } = useEquipmentTable(
        items, onItemsChange, referenceOptions, {
            equipementType: 'Protections',
            defaultFields: { modif_pi: 0, modif_rupture: 0, modif_pr_sol: 0, modif_pr_mag: 0, modif_pr_spe: 0, etat: 'Intact', ...defaultItem },
            resetFieldsOnClear: { modif_pr_sol: 0, modif_pr_spe: 0, modif_pr_mag: 0, modif_rupture: 0 },
            onRemove,
        }
    );

    const calculateTotalPr = (base: number, modif: number): string | number => {
        const total = parseInt(String(base || 0), 10) + parseInt(String(modif || 0), 10);
        return total !== 0 ? total : '-';
    };

    const [hoveredInfo, setHoveredInfo] = React.useState<{ id: string, x: number, y: number, content: any } | null>(null);

    return (
        <div className="mb-6 p-6 bg-parchment/30 rounded-lg shadow-sm border border-leather/20 relative">
            <div className="flex justify-between items-center mb-4 border-b border-leather/20 pb-2">
                <h3 className="text-xl font-bold text-leather font-serif">Protections</h3>
                <div className="flex gap-2">
                    <button onClick={handleAddRow} className="px-3 py-1 bg-leather text-parchment font-serif font-bold rounded hover:bg-leather-dark active:scale-95 transition-all shadow-sm" title="Ajouter une ligne">+</button>
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
                            <th className="p-2 w-24 text-center">Couvre</th>
                            <th className="p-2 w-20 text-center">Rup</th>
                            <th className="p-2 w-16 text-center">Mod</th>
                            <th className="p-2">Effet</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="text-ink">
                        {items.map((item) => {
                            const refItem = getRefItem(item.refId);
                            const refPrSol = getRefValue(item.refId, 'pr_sol');
                            const refPrSpe = getRefValue(item.refId, 'pr_spe');
                            const refPrMag = getRefValue(item.refId, 'pr_mag');
                            const refRupture = getRefValue(item.refId, 'rupture');

                            const isShield = getRefValue(item.refId, 'type') === 'Bouclier';
                            const isInactive = isShield && !bouclierActif;

                            const aura = refItem?.raw?.details?.aura || '-';
                            const type = refItem?.raw?.details?.type || '-';
                            const rupture = refItem?.raw?.details?.rupture || '-';
                            const effet = refItem?.raw?.details?.effet || '-';
                            const idDisplay = refItem?.ref_id || '-';

                            return (
                                <tr key={item.uid} className={`border-b border-leather-light/30 hover:bg-leather/5 transition-opacity duration-300 ${isInactive ? 'opacity-50 grayscale' : ''}`}>
                                    <td className="p-2 text-xs text-ink-light">{getRefValue(item.refId, 'ref_id') || '-'}</td>
                                    <td className="p-2 text-sm italic">
                                        {getRefValue(item.refId, 'type')}
                                        {isShield && !bouclierActif && <span className="ml-1 text-[10px] text-red-500 font-bold">(Inactif)</span>}
                                    </td>
                                    <td className="p-2 w-48 max-w-[12rem] cursor-help"
                                        onMouseEnter={(e) => {
                                            if (!refItem) return;
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setHoveredInfo({ id: item.uid, x: rect.left + (rect.width / 2), y: rect.top - 10, content: { nom: refItem.nom, idDisplay, type, aura, rupture, effet } });
                                        }}
                                        onMouseLeave={() => setHoveredInfo(null)}
                                    >
                                        <SearchableSelect
                                            options={referenceOptions.map(r => ({ id: r.id, label: r.nom }))}
                                            value={item.refId}
                                            onChange={(val) => handleSelectChange(item.uid, val)}
                                            className="w-full"
                                        />
                                    </td>

                                    <td className="p-2 text-center font-bold">{calculateTotalPr(refPrSol, item.modif_pr_sol || 0)}</td>
                                    <td className="p-2">
                                        <SmartInput type="number" value={item.modif_pr_sol || 0} onCommit={(val) => handleUpdateField(item.uid, 'modif_pr_sol', Number(val))} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center" placeholder="+0" />
                                    </td>

                                    <td className="p-2 text-center font-bold">{calculateTotalPr(refPrSpe, item.modif_pr_spe || 0)}</td>
                                    <td className="p-2">
                                        <SmartInput type="number" value={item.modif_pr_spe || 0} onCommit={(val) => handleUpdateField(item.uid, 'modif_pr_spe', Number(val))} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center" placeholder="+0" />
                                    </td>

                                    <td className="p-2 text-center font-bold">{calculateTotalPr(refPrMag, item.modif_pr_mag || 0)}</td>
                                    <td className="p-2">
                                        <SmartInput type="number" value={item.modif_pr_mag || 0} onCommit={(val) => handleUpdateField(item.uid, 'modif_pr_mag', Number(val))} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center" placeholder="+0" />
                                    </td>

                                    <td className="p-2">
                                        <EtatSelector value={item.etat || 'Intact'} onChange={(val) => handleUpdateField(item.uid, 'etat', val)} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-sm text-center" />
                                    </td>

                                    <td className="p-2 text-center text-sm truncate max-w-[100px]" title={refItem?.raw?.details?.couvre || ''}>
                                        {refItem?.raw?.details?.couvre || '-'}
                                    </td>

                                    <td className="p-2 text-center">{calculateFinalRupture(refRupture, item.modif_rupture)}</td>
                                    <td className="p-2">
                                        <RuptureModifier baseRupture={refRupture} modifier={item.modif_rupture || 0} onChange={(val) => handleUpdateField(item.uid, 'modif_rupture', val)} className="w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center text-sm" />
                                    </td>

                                    <td className="p-2 text-sm max-w-[150px] truncate">{refItem?.raw?.details?.effet || '-'}</td>

                                    <td className="p-2 text-center">
                                        <button onClick={() => handleRemoveRow(item.uid)} className="text-red-600 hover:text-red-800 font-bold">&times;</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {hoveredInfo && (
                <Tooltip visible={!!hoveredInfo} position={{ x: hoveredInfo.x, y: hoveredInfo.y }} title={hoveredInfo.content.nom || 'Objet Inconnu'}>
                    <div className="flex flex-col gap-1 text-xs min-w-[150px]">
                        <div className="flex justify-between items-center">
                            <span className="text-tooltip-label font-medium">ID :</span>
                            <span className="font-mono text-tooltip-text text-right">{hoveredInfo.content.idDisplay}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-tooltip-label font-medium">Type :</span>
                            <span className="text-tooltip-text text-right">{hoveredInfo.content.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-tooltip-label font-medium">Aura :</span>
                            <span className="font-bold text-tooltip-title text-right">{hoveredInfo.content.aura}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-tooltip-label font-medium">Rupture :</span>
                            <span className="text-tooltip-text text-right">{hoveredInfo.content.rupture}</span>
                        </div>
                        <div className="border-t border-tooltip-border/50 mt-1 pt-1 italic text-xs text-center text-tooltip-label/80 leading-relaxed font-serif">
                            {hoveredInfo.content.effet}
                        </div>
                    </div>
                </Tooltip>
            )}
        </div>
    );
});
