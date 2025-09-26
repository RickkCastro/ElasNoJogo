import { useState, useEffect } from "react";
import { useVideoEdit } from "../../hooks/useVideo";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import { IoChevronBack } from "react-icons/io5";
import LocationAutocomplete from "../../components/LocationAutocomplete";

export default function EditarVideo() {
  const navigate = useNavigate();
  const location = useLocation();
  const video = location.state?.video;

  const { editing, error, editVideo } = useVideoEdit();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
  });

  // Carrega os dados do vídeo quando o componente monta
  useEffect(() => {
    if (video) {
      setForm({
        title: video.title || "",
        description: video.description || "",
        location: video.location || "",
      });
    } else {
      // Se não há vídeo, redireciona para o perfil
      navigate("/perfil");
    }
  }, [video, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) return;

    const result = await editVideo(video.id, {
      title: form.title,
      description: form.description,
      location: form.location,
    });

    if (result.success) {
      // Redireciona de volta para o perfil
      navigate("/perfil", {
        state: { message: "Vídeo editado com sucesso!" },
      });
    }
  };

  const handleCancel = () => {
    navigate("/perfil");
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground-muted">Carregando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 mb-4 w-full max-w-lg mx-auto">
        <Button
          variant="transparente"
          size="small"
          onClick={handleCancel}
          className="p-2"
        >
          <IoChevronBack size={22} />
        </Button>
        <div className="flex-1 flex justify-center">
          <span className="text-2xl font-bold text-foreground tracking-tight select-none">
            Editar Vídeo
          </span>
        </div>
        <div className="w-10 h-10" />
      </header>

      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-background-light rounded-2xl p-6 md:p-8 shadow-xl border border-primary-500/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Preview do vídeo */}
              <div className="text-center">
                <video
                  src={video.video_url}
                  poster={video.thumbnail_url}
                  controls
                  className="w-full rounded-xl mb-4 border-2 border-primary-500/30"
                  style={{ maxHeight: 220 }}
                />
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-foreground-subtle transition-colors"
                  placeholder="Dê um título ao seu vídeo"
                  maxLength={60}
                  required
                  disabled={editing}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={200}
                  className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-foreground-subtle transition-colors resize-none"
                  placeholder="Conte sobre o vídeo..."
                  disabled={editing}
                />
                <p className="text-xs text-foreground-subtle mt-1">
                  {form.description.length}/200 caracteres
                </p>
              </div>

              {/* Localização (Autocomplete) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Localização
                </label>
                <LocationAutocomplete
                  value={form.location}
                  onChange={(val) => setForm((prev) => ({ ...prev, location: val }))}
                  placeholder="Digite para buscar..."
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="cancelar"
                  size="large"
                  onClick={handleCancel}
                  disabled={editing}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="principal"
                  size="large"
                  disabled={editing || !form.title.trim()}
                  loading={editing}
                  className="flex-1"
                >
                  Salvar Alterações
                </Button>
              </div>

              {error && (
                <div className="text-center text-red-500 text-sm mt-4">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
