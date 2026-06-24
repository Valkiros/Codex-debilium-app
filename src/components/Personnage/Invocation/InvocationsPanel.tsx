import { Mount } from '../../../types';
import { CreaturePanel } from '../Shared/CreaturePanel';

interface InvocationPanelProps {
    invocations: Mount[];
    onInvocationsChange: (newMounts: Mount[]) => void;
}

export const InvocationPanel: React.FC<InvocationPanelProps> = ({ invocations, onInvocationsChange }) => (
    <CreaturePanel
        items={invocations}
        onItemsChange={onInvocationsChange}
        config={{
            title: 'Invocations',
            subtitle: 'Gérez les invocations de votre personnage',
            defaultName: 'Nouvelle Invocation',
            deleteTitle: 'Supprimer l\'invocation',
            deleteMessage: 'Êtes-vous sûr de vouloir supprimer cette invocation ? Cette action est irréversible.',
            emptyMessage: 'Aucune invocation pour l\'instant. Cliquez sur "Ajouter" pour en créer une.',
        }}
    />
);
