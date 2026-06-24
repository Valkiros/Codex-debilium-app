import { Mount } from '../../../types';
import { CreaturePanel } from '../Shared/CreaturePanel';

interface FamilierPanelProps {
    familiers: Mount[];
    onFamiliersChange: (newMounts: Mount[]) => void;
}

export const FamilierPanel: React.FC<FamilierPanelProps> = ({ familiers, onFamiliersChange }) => (
    <CreaturePanel
        items={familiers}
        onItemsChange={onFamiliersChange}
        config={{
            title: 'Familiers',
            subtitle: 'Gérez les familiers de votre personnage',
            defaultName: 'Nouveau Familier',
            deleteTitle: 'Supprimer le familier',
            deleteMessage: 'Êtes-vous sûr de vouloir supprimer ce familier ? Cette action est irréversible.',
            emptyMessage: 'Aucun familier pour l\'instant. Cliquez sur "Ajouter" pour en créer un.',
        }}
    />
);
