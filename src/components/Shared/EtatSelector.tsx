import React from 'react';

interface EtatSelectorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const EtatSelector: React.FC<EtatSelectorProps> = React.memo(({ value, onChange, className }) => (
    <select
        value={value || 'Intact'}
        onChange={(e) => onChange(e.target.value)}
        className={className || "w-full p-1 bg-input-bg text-ink border-b border-leather-light focus:border-leather outline-none text-center text-xs"}
    >
        <option value="Intact">Intact</option>
        <option value="Endommagé">Endommagé</option>
        <option value="Cassé">Cassé</option>
    </select>
));
