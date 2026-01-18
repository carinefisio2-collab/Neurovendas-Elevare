import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Header = ({ onOpenQuiz }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo - MAIOR */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_cf253d20-308c-4b29-8e54-b2ea7c71ddad/artifacts/n695y4js_Gemini_Generated_Image_9unc209unc209unc.png"
                alt="Elevare Logo"
                className="h-16 w-auto"
              />
              <span className="text-3xl font-bold hidden sm:block">
                <span className="text-[#4F46E5]">Neuro</span><span className="text-[#4F46E5]">Vendas</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation - LILÁS e FONTE MAIOR */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('diagnostico')}
              className="text-lg font-semibold text-[#4F46E5] hover:text-[#6366F1] transition-colors"
            >
              Diagnóstico
            </button>
            <button 
              onClick={() => scrollToSection('funcionalidades')}
              className="text-lg font-semibold text-[#4F46E5] hover:text-[#6366F1] transition-colors"
            >
              Funcionalidades
            </button>
            <button 
              onClick={() => scrollToSection('planos')}
              className="text-lg font-semibold text-[#4F46E5] hover:text-[#6366F1] transition-colors"
            >
              Planos
            </button>
          </nav>

          {/* CTA Buttons - COM LOGIN */}
          <div className="hidden md:flex items-center gap-4">
            {/* Botão Entrar */}
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5]/10 font-semibold px-5 py-2 rounded-xl"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
            
            {/* Botão Análise Gratuita */}
            <Button 
              onClick={onOpenQuiz}
              className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold text-lg px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all border-0"
            >
              Análise Gratuita
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#4F46E5]"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu - LILÁS */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-6 pt-2 space-y-4 bg-white/95 rounded-xl">
            <button 
              onClick={() => scrollToSection('diagnostico')}
              className="block w-full text-left px-4 py-3 text-base font-semibold text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded transition-colors"
            >
              Diagnóstico
            </button>
            <button 
              onClick={() => scrollToSection('funcionalidades')}
              className="block w-full text-left px-4 py-3 text-base font-semibold text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded transition-colors"
            >
              Funcionalidades
            </button>
            <button 
              onClick={() => scrollToSection('planos')}
              className="block w-full text-left px-4 py-3 text-base font-semibold text-[#4F46E5] hover:bg-[#4F46E5]/10 rounded transition-colors"
            >
              Planos
            </button>
            
            {/* Botões Mobile */}
            <div className="px-4 pt-2 space-y-3">
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5]/10 font-semibold rounded-xl"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
              <Button 
                onClick={onOpenQuiz}
                className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold w-full rounded-xl"
              >
                Análise Gratuita
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
