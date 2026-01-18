import { useState } from "react";
import "./ResultadoBio.css";

interface ResultadoBioProps {
  score: number;
  respostas: number[];
  onContinue: () => void;
  onViewDiagnostico: () => void;
}

interface NivelBio {
  nivel: string;
  mensagem: string;
  descricao: string;
  emoji: string;
  cor: string;
}

export function ResultadoBio({ score, respostas, onContinue, onViewDiagnostico }: ResultadoBioProps) {
  const [mostrarDiagnostico, setMostrarDiagnostico] = useState(false);

  let nivelBio: NivelBio;

  if (score <= 6) {
    nivelBio = {
      nivel: "Bio Invisível",
      mensagem: "Seu Instagram até existe, mas não vende.",
      descricao: "Você perde clientes antes mesmo da conversa começar. Sua bio não deixa claro quem você é, para quem trabalha ou por que deveriam te escolher.",
      emoji: "👻",
      cor: "#ef4444"
    };
  } else if (score <= 9) {
    nivelBio = {
      nivel: "Bio Estética, mas Fraca",
      mensagem: "Você atrai curiosas, mas não conduz à decisão.",
      descricao: "Sua bio é bonita, mas genérica. Qualquer esteticista poderia ter escrito isso. Você não se diferencia e deixa dinheiro na mesa.",
      emoji: "🌙",
      cor: "#f59e0b"
    };
  } else {
    nivelBio = {
      nivel: "Bio Magnética",
      mensagem: "Sua bio já trabalha por você.",
      descricao: "Parabéns! Sua bio gera desejo, constrói autoridade e conduz ao agendamento. Agora é hora de otimizar a escala.",
      emoji: "✨",
      cor: "#10b981"
    };
  }

  return (
    <div className="resultado-bio-container">
      <div className="resultado-header">
        <div className="nivel-emoji">{nivelBio.emoji}</div>
        <h2 className="nivel-titulo">{nivelBio.nivel}</h2>
        <p className="nivel-mensagem">{nivelBio.mensagem}</p>
      </div>

      <div className="resultado-score">
        <div className="score-circle" style={{ borderColor: nivelBio.cor }}>
          <span className="score-valor">{score}</span>
          <span className="score-max">/ 12</span>
        </div>
      </div>

      <div className="resultado-descricao">
        <p>{nivelBio.descricao}</p>
      </div>

      {!mostrarDiagnostico && (
        <div className="resultado-actions">
          <button
            className="btn-diagnostico"
            style={{ backgroundColor: nivelBio.cor }}
            onClick={onViewDiagnostico}
          >
            Ver Diagnóstico Personalizado
          </button>
          <button className="btn-secundario" onClick={onContinue}>
            Avançar para Próximo Nível
          </button>
        </div>
      )}


    </div>
  );
}
