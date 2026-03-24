import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../../../components';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSantaFeCities } from '../../../../hooks/useSantaFeCities';
import { propertyApi } from '../../../../services/api';
import { getApiErrorMessage } from '../../../../services/backend';
import { mapBackendPropertyToFormState } from '../../../../features/create-publication/mappers';
import { DetailsStep } from '../../../../features/create-publication/DetailsStep';
import { ImageUploadStep } from '../../../../features/create-publication/ImageUploadStep';
import { OperationStep } from '../../../../features/create-publication/OperationStep';
import { PropertyTypeStep } from '../../../../features/create-publication/PropertyTypeStep';
import { SummaryStep } from '../../../../features/create-publication/SummaryStep';
import { useCreatePublication } from '../../../../features/create-publication/useCreatePublication';

export default function EditPropertyRoute() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [propertyTitle, setPropertyTitle] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [initialState, setInitialState] = useState<ReturnType<typeof mapBackendPropertyToFormState> | null>(null);

  const { cities, isLoadingCities, citiesError, reloadCities } = useSantaFeCities();

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setLoadError('No se encontro el identificador de la propiedad.');
        setIsLoadingProperty(false);
        return;
      }

      setIsLoadingProperty(true);
      setLoadError(null);

      try {
        const properties = await propertyApi.listMine();
        const selected = properties.find((item) => String(item.id) === String(id));

        if (!selected) {
          setLoadError('No se encontro la propiedad solicitada.');
          setIsLoadingProperty(false);
          return;
        }

        setInitialState(mapBackendPropertyToFormState(selected));
        setPropertyTitle(selected.title);
        setContactName(selected.contactName ?? '');
      } catch (error) {
        setLoadError(getApiErrorMessage(error));
      } finally {
        setIsLoadingProperty(false);
      }
    };

    void loadProperty();
  }, [id]);

  const {
    currentStep,
    totalSteps,
    state,
    isCurrentStepValid,
    isSubmitting,
    submitError,
    submitWarning,
    createdPropertyId,
    nextStep,
    prevStep,
    updateField,
    reset,
    submit,
  } = useCreatePublication({
    mode: 'edit',
    propertyId: id,
    initialState: initialState ?? undefined,
  });

  const progress = useMemo(() => Math.round((currentStep / totalSteps) * 100), [currentStep, totalSteps]);

  const handleNext = () => {
    if (!isCurrentStepValid) return;
    nextStep();
  };

  const handleConfirm = async () => {
    if (submitted || isSubmitting) return;
    const ownerName = contactName || user?.name;
    const ok = await submit(ownerName);
    if (!ok) return;
    setSubmitted(true);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setSubmitted(false);
    reset();
    setIsResetting(false);
  };

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => {
      navigate('/panel/properties');
    }, 2000);
    return () => clearTimeout(timer);
  }, [submitted, navigate]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
        <Navbar />
        <main className="mx-auto w-full max-w-lg px-4 pb-10">
          <button
            type="button"
            onClick={() => navigate('/panel/properties')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mis propiedades
          </button>
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {loadError}
          </div>
        </main>
      </div>
    );
  }

  if (isLoadingProperty || !initialState) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
        <Navbar />
        <main className="mx-auto w-full max-w-lg px-4 pb-10">
          <p className="mt-6 text-sm text-slate-600">Cargando propiedad...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-lg px-4 pb-10">
        <button
          type="button"
          onClick={() => navigate('/panel/properties')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis propiedades
        </button>

        <section className=" border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <header>
            <h1 className="text-xl font-semibold text-slate-900">Editar publicacion</h1>
            {propertyTitle && <p className="mt-1 text-sm text-slate-600">{propertyTitle}</p>}
            <p className="mt-1 text-sm text-slate-600">
              Paso {currentStep} de {totalSteps}
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
                aria-hidden
              />
            </div>
          </header>

          {submitted ? (
            <div className="mt-6 space-y-4 border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-semibold">Publicacion actualizada correctamente.</p>
              </div>
              {createdPropertyId && <p className="text-sm text-emerald-700">ID: {createdPropertyId}</p>}
              {submitWarning && <p className="text-sm text-amber-700">{submitWarning}</p>}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isResetting}
                  className="w-full  border border-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isResetting ? 'Reiniciando...' : 'Seguir editando'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/panel/properties')}
                  className="w-full  bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                >
                  Volver al listado
                </button>
              </div>
            </div>
          ) : (
            <>
              {submitError && (
                <div className="mt-4 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitError}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Las imagenes actuales se administran desde "Mis propiedades". Aqui podes subir nuevas imagenes.
              </div>

              <div key={currentStep} className="mt-6 transition-all duration-300">
                {currentStep === 1 && <OperationStep state={state} updateField={updateField} />}
                {currentStep === 2 && <PropertyTypeStep state={state} updateField={updateField} />}
                {currentStep === 3 && (
                  <DetailsStep
                    state={state}
                    updateField={updateField}
                    cities={cities}
                    isLoadingCities={isLoadingCities}
                    citiesError={citiesError}
                    onRetryCities={() => {
                      void reloadCities();
                    }}
                  />
                )}
                {currentStep === 4 && <ImageUploadStep state={state} updateField={updateField} />}
                {currentStep === 5 && <SummaryStep state={state} updateField={updateField} />}
              </div>

              <footer className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="w-full  border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentStepValid || isSubmitting}
                    className="w-full  bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSubmitting || submitted}
                    className="w-full  bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                )}
              </footer>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
