import { Mail, MapPin, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L2 6v8h4v-4h4v4h4V6L8 1z" fill="white"/>
                </svg>
              </div>
              <span className="font-display font-bold text-base notranslate">GeoProp</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              El buscador de propiedades más inteligente de Santa Fe. Encontrá oportunidades reales.
            </p>
          </div>

          {/* Info */}
          <div className="flex flex-col sm:flex-row gap-6 text-sm text-gray-400">
            <a href="mailto:contacto@geoprop.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-brand-400" />
              contacto@geoprop.com
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              Rafaela, Santa Fe
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} GeoProp — Todos los derechos reservados</span>
          <a
            href="https://www.gabrielvillalba.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            Desarrollado por Fav-Dev
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
