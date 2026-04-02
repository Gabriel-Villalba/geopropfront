import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Bath, BedDouble, CalendarClock, CarFront, ChevronLeft, ChevronRight,
  Home, LandPlot, LayoutGrid, MapPin, Maximize2, MessageCircle,
  ArrowLeft, Send, User, Mail, ChevronDown, ChevronUp, BadgeCheck, Eye, Wallet,
} from 'lucide-react';
import { Navbar } from '../components';
import { inquiryApi, propertyApi } from '../services/api';
import { getApiErrorMessage } from '../services/backend';
import type { Property } from '../types';

interface PropertyDetailPageLocationState {
  property?: Property;
}

/* ── helpers ── */
const formatPrice = (amount?: number | null, currency?: string | null) => {
  if (!amount || !currency) return 'Consultar precio';
  return `${currency} ${amount.toLocaleString('es-AR')}`;
};
const formatArea = (value?: number | null) => {
  if (value == null) return null;
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m²`;
};
const formatCount = (value: number | null | undefined, singular: string, plural: string) => {
  if (value == null) return null;
  return `${value} ${value === 1 ? singular : plural}`;
};
const formatRelativeDate = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Publicado hoy';
  if (diffDays === 1) return 'Publicado ayer';
  if (diffDays < 30) return `Publicado hace ${diffDays} días`;
  return `Publicado el ${date.toLocaleDateString('es-AR')}`;
};
const formatMoney = (value?: number | null, currency?: string | null) => {
  if (value == null || !currency) return null;
  return `${currency} ${value.toLocaleString('es-AR')}`;
};
const shouldShowCoveredPrice = (type?: Property['type'] | null) =>
  type === 'casa' || type === 'comercial' || type === 'galpon-deposito';
const formatPricePerM2 = (amount?: number | null, area?: number | null, currency?: string | null) => {
  if (!amount || !area || !currency) return null;
  if (area <= 0) return null;
  return `${currency} ${Math.round(amount / area).toLocaleString('es-AR')}`;
};

/* ── contact form state ── */
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export default function PropertyDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const state = location.state as PropertyDetailPageLocationState | null;
  const property = state?.property;

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-soft">
        <Navbar />

        <main className="flex-1 pt-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
              <h1 className="font-display font-semibold text-xl text-ink">No encontramos esa propiedad</h1>
              <p className="mt-2 text-sm text-ink-muted">
                {id ? `La propiedad ${id} no estÃ¡ disponible o expirÃ³.` : 'VolvÃ© al listado para buscar otra opciÃ³n.'}
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-ink hover:bg-surface-muted transition-colors"
              >
                Volver al listado
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* Gallery */
  const images =
    property.images && property.images.length > 0
      ? property.images
      : property.image
        ? [property.image]
        : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [views, setViews] = useState<number | null>(property.views ?? null);
  const hasTrackedView = useRef(false);

  const goPrev = () => setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  const goNext = () => setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1));
  const set = (key: keyof ContactForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  /* publisher */
  const publisherName = property.publisher?.name ?? 'Sin especificar';
  const phoneRaw      = property.publisher?.phone ?? '';
  const phoneDigits   = phoneRaw.replace(/\D/g, '');
  const whatsappLink  = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=Hola, quiero consultar por la propiedad ${property.id}`
    : null;

  /* specs */
  const stats = [
    { label: 'm² totales',   value: formatArea(property.specs?.totalArea),   icon: Maximize2 },
    { label: 'm² cubiertos', value: formatArea(property.specs?.coveredArea),  icon: Home },
    { label: 'm² terreno',   value: formatArea(property.specs?.landArea),     icon: LandPlot },
    { label: 'ambientes',    value: formatCount(property.specs?.rooms, 'ambiente', 'ambientes'), icon: LayoutGrid },
    { label: 'baños',        value: formatCount(property.specs?.bathrooms, 'baño', 'baños'),     icon: Bath },
    { label: 'cochera',      value: formatCount(property.specs?.parking, 'cochera', 'cocheras'), icon: CarFront },
    { label: 'dormitorios',  value: formatCount(property.specs?.bedrooms, 'dormitorio', 'dormitorios'), icon: BedDouble },
    { label: 'antigüedad',   value: formatCount(property.specs?.ageYears, 'año', 'años'),        icon: CalendarClock },
    { label: 'estado',       value: property.condition === 'a_estrenar' ? 'A estrenar' : property.condition === 'usado' ? 'Usado' : property.condition === 'a_refaccionar' ? 'A refaccionar' : null, icon: BadgeCheck },
    { label: 'expensas',     value: formatMoney(property.specs?.expensesMonthly, property.price?.currency), icon: Wallet },
  ].filter((s) => Boolean(s.value));

  /* fake submit — reemplazá con tu lógica */
  const locationLabel = property.subtitle
    ? property.subtitle
    : [property.location?.locality, property.location?.city].filter(Boolean).join(', ');

  useEffect(() => {
    if (!property?.id) return;
    if (hasTrackedView.current) return;

    const storageKey = `geoprop:viewed:${property.id}`;
    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    hasTrackedView.current = true;
    let cancelled = false;
    propertyApi
      .trackView(String(property.id))
      .then((result) => {
        if (!cancelled && typeof result.views === 'number') {
          setViews(result.views);
        }
      })
      .catch(() => null);
    sessionStorage.setItem(storageKey, '1');
    return () => {
      cancelled = true;
    };
  }, [property?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);

    const propertyLine = locationLabel
      ? `Hola, me interesa la propiedad ${property.title} - ubicada en ${locationLabel}.`
      : `Hola, me interesa la propiedad ${property.title}.`;

    try {
      await inquiryApi.createForProperty(String(property.id), {
        name: form.name,
        email: form.email,
        message: form.message,
        source: 'web',
      });

      const text = [
        propertyLine,
        `Nombre: ${form.name.trim()}`,
        `Email: ${form.email.trim()}`,
        `Mensaje: ${form.message.trim()}`,
      ].join('\n');

      const whatsappUrl = `https://wa.me/3492588185?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      setSent(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-soft">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Back ── */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </button>

          {/* ── Breadcrumb title ── */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {property.operation && (
                <span className="bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg border border-brand-100">
                  {property.operation}
                </span>
              )}
              {property.type && (
                <span className="bg-surface-muted text-ink-muted text-xs font-medium uppercase tracking-wide px-2.5 py-1 rounded-lg border border-gray-100">
                  {property.type}
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
              {property.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
              <MapPin className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
              <span>
                {property.location?.city}
                {property.location?.locality ? `, ${property.location.locality}` : ''}
              </span>
            </div>
          </div>

          {/* ── Main grid: gallery + sidebar ── */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left col — gallery + specs + description */}
            <div className="lg:col-span-2 space-y-6">

              {/* Gallery */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                <div className="relative">
                  <img
                    src={images[currentIndex]}
                    alt={property.title}
                    className="w-full h-72 sm:h-[420px] object-cover"
                  />

                  {images.length > 1 && (
                    <>
                      <button onClick={goPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                        <ChevronLeft className="h-5 w-5 text-ink" />
                      </button>
                      <button onClick={goNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                        <ChevronRight className="h-5 w-5 text-ink" />
                      </button>
                      {/* counter badge */}
                      <div className="absolute bottom-3 right-3 bg-ink/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                        {currentIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          i === currentIndex ? 'border-brand-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs */}
              {stats.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-5">
                    Características
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="flex items-center gap-3 bg-surface-soft rounded-xl border border-gray-100 px-4 py-3.5">
                          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-brand-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-ink">{stat.value}</p>
                            <p className="text-[11px] text-ink-faint uppercase tracking-wide">{stat.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {property.descriptionShort && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
                  >
                    Descripción
                    {showDescription ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {showDescription && (
                    <p className="mt-4 text-sm text-ink-muted leading-relaxed whitespace-pre-line">
                      {property.descriptionShort}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right col — price + publisher + contact form */}
            <div className="space-y-5">

              {/* Price card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <p className="text-xs text-ink-muted mb-1">Precio</p>
                <p className="font-display font-bold text-3xl text-ink tracking-tight">
                  {formatPrice(property.price?.amount, property.price?.currency)}
                </p>
                {formatPricePerM2(property.price?.amount, property.specs?.totalArea, property.price?.currency) && (
                  <p className="text-xs text-ink-muted mt-1">
                    {formatPricePerM2(property.price?.amount, property.specs?.totalArea, property.price?.currency)} / m² total
                  </p>
                )}
                {shouldShowCoveredPrice(property.type) &&
                  formatPricePerM2(property.price?.amount, property.specs?.coveredArea, property.price?.currency) && (
                    <p className="text-xs text-ink-muted">
                      {formatPricePerM2(property.price?.amount, property.specs?.coveredArea, property.price?.currency)} / m² cubierto
                    </p>
                  )}

                {formatRelativeDate(property.publishedAt ?? property.createdAt ?? null) && (
                  <p className="text-xs text-ink-faint mt-2">
                    {formatRelativeDate(property.publishedAt ?? property.createdAt ?? null)}
                  </p>
                )}

                {typeof views === 'number' && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
                    <Eye className="h-3.5 w-3.5" />
                    {views} vistas
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs text-ink-muted mb-1">Publicado por</p>
                  <p className="font-semibold text-sm text-ink">{publisherName}</p>
                </div>

                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contactar por WhatsApp
                  </a>
                )}
              </div>

              {/* Contact form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="font-display font-semibold text-base text-ink mb-1">Enviar consulta</h2>
                <p className="text-xs text-ink-muted mb-5">El anunciante recibirá tu mensaje directamente.</p>
                {submitError && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                    {submitError}
                  </div>
                )}


                {sent ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <Send className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="font-semibold text-sm text-ink">¡Mensaje enviado!</p>
                    <p className="text-xs text-ink-muted">El anunciante se pondrá en contacto a la brevedad.</p>
                    <button onClick={() => setSent(false)} className="text-xs text-brand-500 hover:text-brand-600 font-medium mt-1">
                      Enviar otra consulta
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-ink-muted">Nombre</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" />
                        <input
                          required
                          value={form.name}
                          onChange={(e) => set('name', e.target.value)}
                          placeholder="Tu nombre"
                          className="input-base pl-9 text-sm py-2.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-ink-muted">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" />
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => set('email', e.target.value)}
                          placeholder="vos@ejemplo.com"
                          className="input-base pl-9 text-sm py-2.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-ink-muted">Mensaje</label>
                      <textarea
                        required
                        rows={3}
                        value={form.message}
                        onChange={(e) => set('message', e.target.value)}
                        placeholder="Hola, me interesa esta propiedad..."
                        className="input-base text-sm py-2.5 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full justify-center py-2.5 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


