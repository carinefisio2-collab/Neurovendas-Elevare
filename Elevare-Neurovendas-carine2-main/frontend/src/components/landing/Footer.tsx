import React from 'react';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#1F2937] via-[#111827] to-[#1F2937] text-white py-12 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F46E5]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl" />
      
      {/* Accent line no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F46E5] via-accent-gold to-[#8B5CF6]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_cf253d20-308c-4b29-8e54-b2ea7c71ddad/artifacts/n695y4js_Gemini_Generated_Image_9unc209unc209unc.png"
                alt="Elevare Logo"
                className="h-12 w-auto"
              />
              <h3 className="text-2xl font-bold">
                <span className="text-accent-gold">Neuro</span><span className="text-[#8B5CF6]">Vendas</span>
              </h3>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              A primeira plataforma com a linguagem da esteticista, feita para quem quer sair da operação e virar empresária de verdade.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-[#4F46E5] hover:to-accent-gold transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-[#4F46E5] hover:to-accent-gold transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="mailto:contato@elevare.com" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-[#4F46E5] hover:to-accent-gold transition-all duration-300"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#diagnostico" className="text-white/70 hover:text-accent-gold transition-colors">
                  Diagnóstico
                </a>
              </li>
              <li>
                <a href="#funcionalidades" className="text-white/70 hover:text-accent-gold transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#planos" className="text-white/70 hover:text-accent-gold transition-colors">
                  Planos
                </a>
              </li>
              <li>
                <a href="#faq" className="text-white/70 hover:text-accent-gold transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4" />
                <span>contato@elevare.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © 2025 Elevare NeuroVendas. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-white/60 hover:text-accent-gold transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-white/60 hover:text-accent-gold transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
