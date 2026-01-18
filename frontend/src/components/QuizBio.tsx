import { useState } from "react";
import "./QuizBio.css";

interface Pergunta {
  pergunta: string;
  opcoes: Array<{
    texto: string;
    pontos: number;
  }>;
}

interface QuizBioProps {
  onFinish: (score: number, respostas: number[]) => void;
}

const perguntas: Pergunta[] = [
  {
    pergunta: "Sua bio hoje deixa claro:",
    opcoes: [
      { texto: "Só quem eu sou", pontos: 1 },
      { texto: "O que faço, mas não pra quem", pontos: 2 },
      { texto: "Para quem é e por que me escolher", pontos: 3 }
    ]
  },
  {
    pergunta: "Quando alguém entra no seu Instagram:",
    opcoes: [
      { texto: "Precisa procurar o WhatsApp", pontos: 1 },
      { texto: "Encontra, mas sem incentivo", pontos: 2 },
      { texto: "É conduzida direto ao agendamento", pontos: 3 }
    ]
  },
  {
    pergunta: "Sua comunicação é mais:",
    opcoes: [
      { texto: "Informativa", pontos: 1 },
      { texto: "Bonita, mas genérica", pontos: 2 },
      { texto: "Desejável e persuasiva", pontos: 3 }
    ]
  },
  {
    pergunta: "Seus destaques:",
    opcoes: [
      { texto: "Estão desatualizados", pontos: 1 },
      { texto: "Mostram procedimentos", pontos: 2 },
      { texto: "Conduzem à decisão", pontos: 3 }
    ]
  }
];

export default function QuizBio({ onFinish }: QuizBioProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);

  const responder = (pontos: number) => {
    const novoScore = score + pontos;
    const novasRespostas = [...respostas, pontos];
    
    setScore(novoScore);
    setRespostas(novasRespostas);

    if (index + 1 < perguntas.length) {
      setIndex(index + 1);
    } else {
      // Quiz finalizado
      onFinish(novoScore, novasRespostas);
    }
  };

  const perguntaAtual = perguntas[index];
  const progresso = ((index + 1) / perguntas.length) * 100;

  return (
    <div className="quiz-bio-container">
      <div className="quiz-header">
        <h2>Diagnóstico da Bio</h2>
        <p className="quiz-subtitle">Responda com sinceridade para receber seu diagnóstico personalizado</p>
      </div>

      {/* Barra de Progresso */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progresso}%` }}></div>
      </div>

      {/* Pergunta */}
      <div className="quiz-content">
        <h3 className="pergunta-texto">{perguntaAtual.pergunta}</h3>

        {/* Opções */}
        <div className="opcoes-container">
          {perguntaAtual.opcoes.map((opcao, i) => (
            <button
              key={i}
              className="opcao-button"
              onClick={() => responder(opcao.pontos)}
            >
              <span className="opcao-texto">{opcao.texto}</span>
              <span className="opcao-indicator">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Indicador de Progresso */}
      <div className="quiz-footer">
        <p className="progresso-texto">
          Pergunta <strong>{index + 1}</strong> de <strong>{perguntas.length}</strong>
        </p>
      </div>
    </div>
  );
}
