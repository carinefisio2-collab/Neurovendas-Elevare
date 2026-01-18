import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { quizQuestions, quizResults } from '@/data/mock';

const QuizModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('intro'); // intro, quiz, contact, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', whatsapp: '' });
  const [result, setResult] = useState(null);

  const handleStartQuiz = () => {
    setStep('quiz');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    
    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setStep('contact'), 300);
    }
  };

  const handleSubmitContact = (e) => {
    e.preventDefault();
    
    // Calculate result based on answers
    const answerValues = Object.values(answers);
    const countA = answerValues.filter(v => v === 'A').length;
    const countB = answerValues.filter(v => v === 'B').length;
    const countC = answerValues.filter(v => v === 'C').length;

    let resultKey = 'mostly-b';
    if (countA > countB && countA > countC) resultKey = 'mostly-a';
    else if (countC > countA && countC > countB) resultKey = 'mostly-c';

    setResult(quizResults[resultKey]);
    setStep('result');

    // Save to localStorage (mock backend)
    const quizData = {
      timestamp: new Date().toISOString(),
      contactInfo,
      answers,
      result: resultKey
    };
    localStorage.setItem('elevare_quiz_result', JSON.stringify(quizData));
  };

  const resetQuiz = () => {
    setStep('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setContactInfo({ name: '', email: '', whatsapp: '' });
    setResult(null);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-primary-dark/10 hover:bg-primary-dark/20 transition-colors z-10"
        >
          <X className="w-5 h-5 text-primary-dark" />
        </button>

        {/* Intro Step */}
        {step === 'intro' && (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent-gold" />
            </div>
            <h2 className="text-3xl font-bold text-primary-dark mb-4">
              Análise Gratuita de Identidade & Posicionamento
            </h2>
            <p className="text-lg text-primary-dark/70 mb-8">
              Em apenas 5 minutos, você vai descobrir exatamente onde está travando e o que precisa ajustar para crescer
            </p>
            <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary-lavanda/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary-lavanda" />
                </div>
                <span className="text-primary-dark/80">5 perguntas estratégicas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary-lavanda/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary-lavanda" />
                </div>
                <span className="text-primary-dark/80">Diagnóstico personalizado instantâneo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary-lavanda/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary-lavanda" />
                </div>
                <span className="text-primary-dark/80">Recomendações práticas de ação</span>
              </div>
            </div>
            <Button onClick={handleStartQuiz} className="btn-premium" size="lg">
              Começar Análise Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Quiz Step */}
        {step === 'quiz' && (
          <div className="p-8 sm:p-12">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-primary-dark">
                  Pergunta {currentQuestion + 1} de {quizQuestions.length}
                </span>
                <span className="text-sm text-primary-dark/70">
                  {Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-lavanda to-accent-gold transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-primary-dark mb-6">
                {quizQuestions[currentQuestion].question}
              </h3>

              <div className="space-y-3">
                {quizQuestions[currentQuestion].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(quizQuestions[currentQuestion].id, option.value)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      answers[quizQuestions[currentQuestion].id] === option.value
                        ? 'border-primary-lavanda bg-primary-lavanda/10'
                        : 'border-primary-lavanda/20 hover:border-primary-lavanda/40 hover:bg-neutral-light'
                    }`}
                  >
                    <span className="text-primary-dark font-medium">{option.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            {currentQuestion > 0 && (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                variant="outline"
                className="btn-secondary"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar
              </Button>
            )}
          </div>
        )}

        {/* Contact Step */}
        {step === 'contact' && (
          <div className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-lavanda/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-primary-lavanda" />
              </div>
              <h3 className="text-2xl font-bold text-primary-dark mb-2">
                Quase lá! 🎉
              </h3>
              <p className="text-primary-dark/70">
                Preencha seus dados para receber o diagnóstico completo
              </p>
            </div>

            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-dark mb-2">
                  Seu nome
                </label>
                <Input
                  type="text"
                  placeholder="Maria Silva"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-dark mb-2">
                  Seu melhor e-mail
                </label>
                <Input
                  type="email"
                  placeholder="maria@email.com"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-dark mb-2">
                  WhatsApp (opcional)
                </label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={contactInfo.whatsapp}
                  onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                  className="w-full"
                />
              </div>

              <Button type="submit" className="btn-premium w-full" size="lg">
                Ver Meu Diagnóstico
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-xs text-primary-dark/60 text-center">
                Seus dados estão seguros e não serão compartilhados
              </p>
            </form>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && result && (
          <div className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-lavanda to-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-primary-dark mb-3">
                {result.title}
              </h3>
              <p className="text-lg text-primary-dark/70 leading-relaxed">
                {result.description}
              </p>
            </div>

            <div className="bg-neutral-light p-6 rounded-xl mb-6">
              <h4 className="font-bold text-primary-dark mb-4">
                Próximos passos recomendados:
              </h4>
              <ul className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-lavanda rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-primary-dark/80">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => {
                  handleClose();
                  document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-premium flex-1"
                size="lg"
              >
                Ver Planos
              </Button>
              <Button 
                onClick={() => {
                  const text = `Olá! Acabei de fazer a análise no Elevare e gostaria de saber mais sobre a plataforma.`;
                  window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
                }}
                variant="outline"
                className="btn-secondary flex-1"
                size="lg"
              >
                Falar no WhatsApp
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;
