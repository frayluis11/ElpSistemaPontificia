import React from 'react';
import { Heart, Globe, Mail, Phone } from 'lucide-react';

/**
 * Componente Footer del Sistema ELP Pontificia
 * Contiene información de copyright, versión y contacto
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="layout-footer mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          {/* Información de copyright */}
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm">
                © {currentYear} Sistema ELP - Pontificia Universidad
              </span>
            </div>
            <div className="text-sm text-gray-300">
              Versión 1.0.0
            </div>
          </div>

          {/* Enlaces y contacto */}
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
            {/* Enlaces rápidos */}
            <div className="flex items-center space-x-4 text-sm">
              <a 
                href="#" 
                className="hover:text-accent-400 transition-colors duration-200"
              >
                Términos de Uso
              </a>
              <span className="text-gray-400">|</span>
              <a 
                href="#" 
                className="hover:text-accent-400 transition-colors duration-200"
              >
                Privacidad
              </a>
              <span className="text-gray-400">|</span>
              <a 
                href="#" 
                className="hover:text-accent-400 transition-colors duration-200"
              >
                Ayuda
              </a>
            </div>

            {/* Información de contacto */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>pontificia.edu</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>soporte@pontificia.edu</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-600 mt-4 pt-4">
          <div className="text-center text-sm text-gray-400">
            <p>
              Desarrollado con 
              <Heart className="w-3 h-3 inline mx-1 text-red-400" />
              para la comunidad educativa pontificia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;