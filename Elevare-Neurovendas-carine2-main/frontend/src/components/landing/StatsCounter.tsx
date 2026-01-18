import React, { useEffect, useRef, useState } from 'react';
import { Users, TrendingUp, Award, Calendar } from 'lucide-react';

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          const startTime = Date.now();
          const endTime = startTime + duration;

          const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuad = progress * (2 - progress); // Easing function
            const currentCount = Math.floor(easeOutQuad * end);

            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={countRef}>
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
};

const StatsCounter = () => {
  const stats = [
    {
      icon: TrendingUp,
      value: 87,
      suffix: '%',
      label: 'Aumento médio em engajamento',
      color: 'from-primary-lavanda to-secondary-lavanda'
    },
    {
      icon: Calendar,
      value: 2.4,
      suffix: 'x',
      label: 'Mais agendamentos',
      color: 'from-accent-gold to-primary-lavanda'
    },
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: 'Profissionais impactados',
      color: 'from-secondary-lavanda to-accent-gold'
    },
    {
      icon: Award,
      value: 6,
      suffix: 'k+',
      label: 'Conteúdos gerados',
      color: 'from-primary-lavanda to-primary-dark'
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-neutral-light to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="text-center group"
              >
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Number */}
                <div className="text-4xl lg:text-5xl font-bold text-primary-dark mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>

                {/* Label */}
                <div className="text-sm lg:text-base text-primary-dark/70 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
