import { Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import type { StepProps } from './types';

interface ImagePreview {
  key: string;
  name: string;
  url: string;
}

function toPreviews(files: File[]): ImagePreview[] {
  return files.map((file) => ({
    key: `${file.name}-${file.lastModified}`,
    name: file.name,
    url: URL.createObjectURL(file),
  }));
}

export function ImageUploadStep({ state, updateField }: StepProps) {
  const previews = useMemo(() => toPreviews(state.imagenes), [state.imagenes]);
  const requiredCount = 3;
  const currentCount = state.imagenes.length;
  const progressCount = Math.min(currentCount, requiredCount);
  const missingCount = Math.max(requiredCount - currentCount, 0);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    updateField('imagenes', [...state.imagenes, ...Array.from(files)]);
  };

  const removeImage = (key: string) => {
    const next = state.imagenes.filter((file) => `${file.name}-${file.lastModified}` !== key);
    updateField('imagenes', next);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Subir imagenes</h2>
        <p className="text-sm text-slate-600">Minimo {requiredCount} fotos para publicar. Progreso: {progressCount}/{requiredCount}.</p>
        {missingCount > 0 && (
          <p className="text-xs text-amber-700 mt-1">Faltan {missingCount} foto(s) para completar.</p>
        )}
      </div>

      <label className="flex cursor-pointer items-center justify-center gap-2  border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-700">
        <UploadCloud className="h-5 w-5" />
        Seleccionar imagenes
        <input type="file" multiple accept="image/*" className="hidden" onChange={(event) => handleFiles(event.target.files)} />
      </label>

      {previews.length === 0 ? (
        <p className="text-sm text-slate-600">Todavia no cargaste imagenes.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((preview) => (
            <article key={preview.key} className="overflow-hidden  border border-slate-200 bg-white">
              <img src={preview.url} alt={preview.name} className="h-24 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2">
                <p className="truncate text-xs text-slate-600">{preview.name}</p>
                <button
                  type="button"
                  onClick={() => removeImage(preview.key)}
                  className="rounded-md p-1 text-rose-600 transition hover:bg-rose-50"
                  aria-label={`Eliminar ${preview.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
