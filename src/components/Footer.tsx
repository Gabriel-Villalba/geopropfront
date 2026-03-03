import { Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-orange-500 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* Parte principal */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">

          {/* IZQUIERDA */}
          <div className="flex justify-center md:justify-start">
            <h3 className="text-lg font-semibold notranslate">
              GeoProp
            </h3>
          </div>

          {/* DERECHA */}
          <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 text-center md:text-right">


            <div className="flex items-center justify-center md:justify-end gap-2 text-sm">
              <Mail className="w-4 h-4" />
              contacto@geoprop.com
            </div>

            <div className="flex items-center justify-center md:justify-end gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              Rafaela, Santa Fe
            </div>

          </div>
        </div>

      {/* COPY + DEV */}
            <div className="mt-4 pt-3 border-t border-orange-400 text-xs text-orange-100">
            <div className="flex justify-between items-center">
                
                <span>
                © {new Date().getFullYear()} GeoProp — Todos los derechos reservados
                </span>

                <span>
                Desarrollado por{" "}
                <a
                    href="https://www.gabrielvillalba.com.ar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:underline transition"
                >
                    Fav-Dev
                </a>
                </span>

            </div>
            </div>


      </div>
    </footer>
  );
}
