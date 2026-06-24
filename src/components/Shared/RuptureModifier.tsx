import React from 'react';
import { getMaxRuptureOptions } from '../../utils/sacUtils';

interface RuptureModifierProps {
    baseRupture: string | undefined;
    modifier: number;
    onChange: (value: number) => void;
    className?: string;
}

export const RuptureModifier: React.FC<RuptureModifierProps> = React.memo(({ baseRupture, modifier, onChange, className }) => {
    const options = getMaxRuptureOptions(baseRupture);
    return (
        <select
            value={modifier || 0}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className={className || "w-full bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center text-xs"}
        >
            {options.map(opt => (
                <option key={opt} value={opt}>+{opt}</option>
            ))}
        </select>
    );
});
