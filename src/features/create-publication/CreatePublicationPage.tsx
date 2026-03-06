import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { DetailsStep } from './DetailsStep';
import { ImageUploadStep } from './ImageUploadStep';
import { OperationStep } from './OperationStep';
import { PropertyTypeStep } from './PropertyTypeStep';
import { SummaryStep } from './SummaryStep';
import { useCreatePublication } from './useCreatePublication';

export function CreatePublicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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
  } = useCreatePublication();

  const progress = useMemo(() => Math.round((currentStep / totalSteps) * 100), [currentStep, totalSteps]);

  const handleNext = () => {
    if (!isCurrentStepValid) return;
    nextStep();
  };

  const handleConfirm = async () => {
    if (submitted || isSubmitting) return;
    const ok = await submit(user?.name);
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
    if (submitted) {
      const timer = setTimeout(() => {
        navigate('/panel');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto w-full max-w-lg px-4 pb-10">
        <button
          type="button"
          onClick={() => navigate('/panel')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </button>

        <section className=" border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <header>
            <h1 className="text-xl font-semibold text-slate-900">Crear publicacion</h1>
            <p className="mt-1 text-sm text-slate-600">Paso {currentStep} de {totalSteps}</p>
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
                <p className="text-sm font-semibold">Publicacion creada correctamente.</p>
              </div>
              {createdPropertyId && <p className="text-sm text-emerald-700">ID generado: {createdPropertyId}</p>}
              {submitWarning && <p className="text-sm text-amber-700">{submitWarning}</p>}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isResetting}
                  className="w-full  border border-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isResetting ? 'Reiniciando...' : 'Crear otra publicacion'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/panel/properties')}
                  className="w-full  bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                >
                  Ir a mis propiedades
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

              <div key={currentStep} className="mt-6 transition-all duration-300">
                {currentStep === 1 && <OperationStep state={state} updateField={updateField} />}
                {currentStep === 2 && <PropertyTypeStep state={state} updateField={updateField} />}
                {currentStep === 3 && <DetailsStep state={state} updateField={updateField} />}
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
                    {isSubmitting ? 'Publicando...' : 'Confirmar publicacion'}
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
