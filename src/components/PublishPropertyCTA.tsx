import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PublishPropertyCTA() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    navigate('/panel/properties/create');
  };

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center justify-center gap-2
        bg-blue-600
        px-5 py-3
        text-sm font-semibold text-white
        shadow-lg
        transition
        hover:bg-blue-700
        active:scale-[0.98]
      "
    >
      <Plus size={18} />
      Publica tu propiedad
    </button>
  );
}
