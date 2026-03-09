import { useEffect, useState } from 'react';
import type { ListingDuration, ListingType, RenewListingPayload } from '../../types';
import { ListingPlanSelector, type ListingPlanSelection } from './ListingPlanSelector';

interface RenewListingModalProps {
  open: boolean;
  propertyTitle: string;
  initialType?: ListingType;
  initialDuration?: ListingDuration;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (selection: RenewListingPayload) => Promise<void> | void;
}

export function RenewListingModal({
  open,
  propertyTitle,
  initialType = 'normal',
  initialDuration = 30,
  isSubmitting = false,
  error = null,
  onClose,
  onConfirm,
}: RenewListingModalProps) {
  const [selection, setSelection] = useState<ListingPlanSelection>({
    listingType: initialType,
    listingDuration: initialDuration,
  });

  useEffect(() => {
    if (!open) return;
    setSelection({
      listingType: initialType,
      listingDuration: initialDuration,
    });
  }, [open, initialDuration, initialType]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Renovar publicacion</h2>
        <p className="mt-1 text-sm text-slate-600">{propertyTitle}</p>

        <div className="mt-4">
          <ListingPlanSelector value={selection} onChange={setSelection} disabled={isSubmitting} />
        </div>

        {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void onConfirm(selection)}
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Procesando...' : selection.listingType === 'featured' ? 'Continuar al pago' : 'Renovar'}
          </button>
        </div>
      </div>
    </div>
  );
}
