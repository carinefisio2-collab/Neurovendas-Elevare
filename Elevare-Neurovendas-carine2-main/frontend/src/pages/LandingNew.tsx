import { useState } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import StatsCounter from '@/components/landing/StatsCounter';
import DiagnosticPillars from '@/components/landing/DiagnosticPillars';
import HowItWorks from '@/components/landing/HowItWorks';
import BeforeAfter from '@/components/landing/BeforeAfter';
import WhyDifferent from '@/components/landing/WhyDifferent';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ResultsTimeline from '@/components/landing/ResultsTimeline';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ObjectionsSection from '@/components/landing/ObjectionsSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import DiagnosticQuizModal from '@/components/landing/DiagnosticQuizModal';
import WhatsAppFloat from '@/components/landing/WhatsAppFloat';

export default function LandingNew() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header onOpenQuiz={() => setIsQuizOpen(true)} />
      <HeroSection onOpenQuiz={() => setIsQuizOpen(true)} />
      <StatsCounter />
      <DiagnosticPillars />
      <HowItWorks />
      <BeforeAfter />
      <WhyDifferent />
      <FeaturesSection />
      <ResultsTimeline />
      <TestimonialsSection />
      <ObjectionsSection />
      <PricingSection />
      <CTASection onOpenQuiz={() => setIsQuizOpen(true)} />
      <Footer />
      
      {/* Floating Elements - hide when quiz is open */}
      {!isQuizOpen && <WhatsAppFloat onOpenQuiz={() => setIsQuizOpen(true)} />}
      <DiagnosticQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </div>
  );
}
