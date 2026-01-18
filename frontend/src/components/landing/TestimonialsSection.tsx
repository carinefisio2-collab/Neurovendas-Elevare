import React from 'react';
import { Star } from 'lucide-react';
import { testimonials } from '@/data/mock';

const TestimonialsSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-[#F9F9F9] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#4F46E5]/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6 leading-tight">
            Histórias reais de{' '}
            <span className="text-[#4F46E5]">transformação</span>
          </h2>
          <p className="text-lg text-[#1F2937]/70 leading-relaxed">
            Veja como profissionais como você saíram da operação e viraram empresárias
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white p-8 rounded-2xl border-2 border-[#4F46E5]/10 hover:border-[#4F46E5]/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              {/* Accent dourado no topo */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold via-[#FFD700] to-accent-gold" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 fill-accent-gold text-accent-gold" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-[#1F2937]/80 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="border-t border-[#4F46E5]/20 pt-4">
                <div className="font-bold text-[#1F2937]">
                  {testimonial.name}
                </div>
                <div className="text-sm text-[#4F46E5]/80 font-medium">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
