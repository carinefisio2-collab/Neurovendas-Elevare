import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqData } from '@/data/mock';

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 lg:py-32 bg-neutral-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-dark mb-6">
            Perguntas <span className="text-primary-lavanda">frequentes</span>
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, idx) => (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`}
                className="bg-white border border-primary-lavanda/20 rounded-xl px-6 data-[state=open]:border-primary-lavanda/40 data-[state=open]:shadow-lg transition-all"
              >
                <AccordionTrigger className="text-left font-semibold text-primary-dark hover:text-primary-lavanda transition-colors py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-primary-dark/70 leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-primary-dark mb-4">
            Ainda tem dúvidas?
          </p>
          <p className="text-primary-dark/70">
            Entre em contato pelo WhatsApp:{' '}
            <a 
              href="https://wa.me/5511999999999" 
              className="text-primary-lavanda font-semibold hover:text-accent-gold transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              (11) 99999-9999
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
