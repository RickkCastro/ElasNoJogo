import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const API_URL = "https://v3.football.api-sports.io/fixtures?league=..." // ajuste
const API_KEY = "live_73f7f4fbee65edd8e140a2e612e12f"

function App() {
  const [rodadas, setRodadas] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, {
          headers: { "x-apisports-key": API_KEY }
        });
        const data = await res.json();

        const partidas = data.response;
        const rodadasAgrupadas = {};

        partidas.forEach(jogo => {
          const rodada = jogo.league.round || "Rodada indefinida";
          if (!rodadasAgrupadas[rodada]) rodadasAgrupadas[rodada] = [];
          rodadasAgrupadas[rodada].push(jogo);
        });

        setRodadas(rodadasAgrupadas);
      } catch (err) {
        console.error("Erro ao carregar partidas:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Campeonatos</h1>
      {Object.keys(rodadas).map(rodada => (
        <div className="card-campeonato" key={rodada}>
          <div className="titulo">Brasileirão Feminino A1</div>
          <div className="descricao">{rodada}</div>
          {rodadas[rodada].map(jogo => {
            const home = jogo.goals?.home ?? "-";
            const away = jogo.goals?.away ?? "-";
            const resultado = `${home} - ${away}`;

            let status = "draw";
            if (home > away) status = "win";
            else if (away > home) status = "loss";

            return (
              <div className={`partida ${status}`} key={jogo.fixture.id}>
                <div className="times">
                  {jogo.teams.home.name} x {jogo.teams.away.name}
                </div>
                <div className="resultado">{resultado}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);