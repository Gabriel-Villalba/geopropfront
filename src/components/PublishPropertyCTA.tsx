import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function PublishPropertyCTA() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    navigate('/panel/properties/create');
  };

  const handleAccept = () => {
    setShowModal(false);
     navigate('/login?redirect=/panel/properties/create');
  };

  const handleCancel = () => {
    setShowModal(false);
    navigate('/dashboard');
  };

  return (
    <>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white shadow-xl p-6 w-[90%] max-w-md text-center">

            <h2 className="text-lg font-semibold mb-2">
              Debes iniciar sesión
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Para publicar una propiedad necesitas estar logueado en GeoProp.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm  border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm  bg-orange-600 text-white hover:bg-orange-700"
              >
                Aceptar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}