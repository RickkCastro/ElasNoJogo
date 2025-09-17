import { useEffect, useState } from "react";
import Menu from "../../components/Menu";
import Loading from "../../components/Loading";

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const API_BASE_URL = "https://v3.football.api-sports.io";

export default function Jogos() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("Brazil");

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/leagues?country=${selectedCountry}`,
          {
            headers: {
              "X-RapidAPI-Key": API_KEY,
              "X-RapidAPI-Host": "v3.football.api-sports.io",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors[0]);
        }

        setLeagues(data.response || []);
      } catch (err) {
        console.error("Erro ao buscar ligas:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [selectedCountry]);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background">
        <Menu />
        <Loading fullScreen={false} text="Carregando ligas..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Menu />
      <div className="max-w-6xl mx-auto p-4 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">
            Ligas de Futebol
          </h1>
          <p className="text-foreground-muted">
            Explore as principais ligas de futebol ao redor do mundo
          </p>
        </div>

        {/* Filtro por país */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Filtrar por país:
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="px-4 py-2 border border-primary-500/30 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Brazil">Brasil</option>
            <option value="England">Inglaterra</option>
            <option value="Spain">Espanha</option>
            <option value="Germany">Alemanha</option>
            <option value="Italy">Itália</option>
            <option value="France">França</option>
            <option value="Argentina">Argentina</option>
            <option value="Portugal">Portugal</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Erro:</strong> {error}
            <div className="text-sm mt-2">
              Verifique se sua chave de API está correta e ativa.{" "}
              <a
                href="https://dashboard.api-football.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Painel da API
              </a>
            </div>
          </div>
        )}

        {!error && leagues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-foreground-muted">
              Nenhuma liga encontrada para {selectedCountry}
            </div>
          </div>
        )}

        {/* Grid de ligas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((item) => {
            const league = item.league;
            const country = item.country;
            const seasons = item.seasons || [];
            const currentSeason = seasons[seasons.length - 1];

            return (
              <div
                key={league.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                {/* Header do card */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    {league.logo && (
                      <img
                        src={league.logo}
                        alt={league.name}
                        className="w-12 h-12 object-contain"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {league.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {country.flag && (
                          <img
                            src={country.flag}
                            alt={country.name}
                            className="w-4 h-3 object-cover rounded-sm"
                            loading="lazy"
                          />
                        )}
                        <span>{country.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do card */}
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium text-black capitalize">
                        {league.type}
                      </span>
                    </div>

                    {currentSeason && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Temporada atual:
                          </span>
                          <span className="font-medium text-black">
                            {currentSeason.year}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Início:</span>
                          <span className="font-medium text-black">
                            {new Date(currentSeason.start).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fim:</span>
                          <span className="font-medium text-black">
                            {new Date(currentSeason.end).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`font-medium px-2 py-1 rounded-full text-xs ${
                              currentSeason.current
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {currentSeason.current ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer informativo */}
        <div className="mt-12 text-center text-sm text-foreground-muted">
          <p>
            Dados fornecidos pela{" "}
            <a
              href="https://www.api-football.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:underline"
            >
              API-Football
            </a>
          </p>
          <p className="mt-2">
            Total de ligas encontradas: <strong>{leagues.length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
