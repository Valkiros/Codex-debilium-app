import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Equipement, RefEquipement } from '../types';

interface UseEquipmentTableConfig {
    equipementType: Equipement['equipement_type'];
    defaultFields?: Partial<Equipement>;
    resetFieldsOnClear?: Partial<Equipement>;
    onRemove?: (uid: string) => void;
}

export function useEquipmentTable(
    items: Equipement[],
    onItemsChange: (items: Equipement[]) => void,
    referenceOptions: RefEquipement[],
    config: UseEquipmentTableConfig
) {
    const refsById = useMemo(() => {
        const map = new Map<number, RefEquipement>();
        for (const r of referenceOptions) map.set(r.id, r);
        return map;
    }, [referenceOptions]);

    const handleAddRow = useCallback(() => {
        const newItem: Equipement = {
            uid: uuidv4(),
            id: '',
            refId: 0,
            equipement_type: config.equipementType,
            ...config.defaultFields,
        };
        onItemsChange([...items, newItem]);
    }, [items, onItemsChange, config.equipementType, config.defaultFields]);

    const handleRemoveRow = useCallback((uid: string) => {
        if (config.onRemove) {
            config.onRemove(uid);
        } else {
            onItemsChange(items.filter(item => item.uid !== uid));
        }
    }, [items, onItemsChange, config.onRemove]);

    const handleSelectChange = useCallback((uid: string, refIdStr: string) => {
        const refId = parseInt(refIdStr);
        const refItem = refsById.get(refId);
        if (refItem) {
            onItemsChange(items.map(item =>
                item.uid === uid ? { ...item, refId: refItem.id } : item
            ));
        } else {
            onItemsChange(items.map(item =>
                item.uid === uid ? { ...item, refId: 0, ...config.resetFieldsOnClear } : item
            ));
        }
    }, [items, onItemsChange, refsById, config.resetFieldsOnClear]);

    const handleUpdateField = useCallback((uid: string, field: string, value: any) => {
        onItemsChange(items.map(item =>
            item.uid === uid ? { ...item, [field]: value } : item
        ));
    }, [items, onItemsChange]);

    const getRefValue = useCallback((refId: number, key: string, subKey?: string): any => {
        const r = refsById.get(refId);
        if (!r) return '';
        if (subKey && r.raw && r.raw.details) return r.raw.details[subKey];
        if (subKey && (r as any)[key]) return (r as any)[key][subKey];
        return (r as any)[key] || '';
    }, [refsById]);

    const getRefItem = useCallback((refId: number): RefEquipement | undefined => {
        return refsById.get(refId);
    }, [refsById]);

    return {
        handleAddRow,
        handleRemoveRow,
        handleSelectChange,
        handleUpdateField,
        getRefValue,
        getRefItem,
    };
}
