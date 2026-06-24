import { GiDna1, GiScrollUnfurled, GiAbacus, GiPoisonBottle, GiBeerStein, GiBookCover, GiOpenBook } from 'react-icons/gi';

export type IndexSection = 'origines' | 'metiers' | 'competences' | 'formules' | 'corruption' | 'alcool-drogues' | 'documents';

interface IndexSidebarProps {
    activeSection: IndexSection;
    onSectionChange: (section: IndexSection) => void;
}

const SECTIONS: { id: IndexSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'origines', label: 'Origines', icon: GiDna1 },
    { id: 'metiers', label: 'Métiers & Spécialisations', icon: GiScrollUnfurled },
    { id: 'competences', label: 'Compétences', icon: GiOpenBook },
    { id: 'formules', label: 'Formules & Calculs', icon: GiAbacus },
    { id: 'corruption', label: 'Corruption', icon: GiPoisonBottle },
    { id: 'alcool-drogues', label: 'Alcool & Drogues', icon: GiBeerStein },
    { id: 'documents', label: 'Documents & PDFs', icon: GiBookCover },
];

export function IndexSidebar({ activeSection, onSectionChange }: IndexSidebarProps) {
    return (
        <aside className="w-64 bg-leather/10 border-r border-leather/20 flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-leather/20">
                <h2 className="text-lg font-serif font-bold text-leather">Sommaire</h2>
            </div>
            <nav className="py-2">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => onSectionChange(id)}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-sm font-serif ${
                            activeSection === id
                                ? 'bg-leather text-parchment font-bold'
                                : 'text-leather hover:bg-leather/10'
                        }`}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {label}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
