import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function PublishPropertyCTA() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) { setShowModal(true); return; }
    navigate('/panel/properties/create');
  };

  return (
    <>
      <button onClick={handleClick} className="btn-primary flex-shrink-0">
        <Plus className="w-4 h-4" />
        Publicar propiedad
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-modal p-6 w-full max-w-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Plus className="w-5 h-5 text-brand-600" />
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h2 className="font-display font-bold text-lg text-ink">Iniciá sesión primero</h2>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Para publicar una propiedad necesitás tener una cuenta en GeoProp.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setShowModal(false); navigate('/dashboard'); }}
                className="btn-outline flex-1 justify-center">
                Cancelar
              </button>
              <button onClick={() => { setShowModal(false); navigate('/login?redirect=/panel/properties/create'); }}
                className="btn-primary flex-1 justify-center">
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
