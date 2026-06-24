import { Mount } from '../../../types';
import { CreaturePanel } from '../Shared/CreaturePanel';

interface MonturePanelProps {
    mounts: Mount[];
    onMountsChange: (newMounts: Mount[]) => void;
}

export const MonturePanel: React.FC<MonturePanelProps> = ({ mounts, onMountsChange }) => (
    <CreaturePanel
        items={mounts}
        onItemsChange={onMountsChange}
        config={{
            title: 'Montures',
            subtitle: 'Gérez les montures de votre personnage',
            defaultName: 'Nouvelle Monture',
            deleteTitle: 'Supprimer la monture',
            deleteMessage: 'Êtes-vous sûr de vouloir supprimer cette monture ? Cette action est irréversible.',
            emptyMessage: 'Aucune monture pour l\'instant. Cliquez sur "Ajouter" pour en créer une.',
        }}
    />
);
