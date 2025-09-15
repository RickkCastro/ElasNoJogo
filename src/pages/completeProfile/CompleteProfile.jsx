import { useState } from "react";
import useUser from "../../hooks/useUser";
import supabase from "../../lib/supabaseClient";
import DialogComponents from "../../components/DialogComponents";
import Button from "../../components/Button";

export default function CompleteProfile() {
  const { user } = useUser();

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    profile_type: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          avatar_url: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        id: user.id,
        updated_at: new Date().toUTCString(),
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
        profile_type: formData.profile_type,
        avatar_url: formData.avatar_url,
      };

      await supabase.from("profiles").insert(profileData);

      setIsDialogOpen(true);
    } catch (error) {
      console.error("Erro ao completar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <DialogComponents
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Perfil Criado!"
        description="Seu perfil foi criado com sucesso!"
        btText2="Continuar"
        btAction02={() => window.location.reload()}
      />

      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-500 mb-4">
            Quase lá!
          </h1>
          <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
            Complete seu perfil antes de continuar.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-background-light rounded-2xl p-6 md:p-8 shadow-xl border border-primary-500/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto de Perfil */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto bg-background rounded-full border-4 border-primary-500/30 flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-8 h-8 text-foreground-muted"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                <label
                  htmlFor="profile-image"
                  className="absolute -bottom-2 -right-2 bg-secondary-500 hover:bg-secondary-600 text-foreground rounded-full p-2 cursor-pointer transition-colors shadow-lg"
                >
                  <svg
                    className="w-4 h-4 text-foreground-muted"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 12H20M12 4V20"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>{" "}
                  </svg>
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-foreground-subtle mt-2">
                Clique no ícone + para adicionar sua foto
              </p>
            </div>

            {/* Nome de usuário */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome de usuário
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                         placeholder-foreground-subtle transition-colors"
                placeholder="@seuusername"
              />
            </div>

            {/* Nome completo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome completo
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                         placeholder-foreground-subtle transition-colors"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Tipo de perfil */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Eu sou...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                    formData.profile_type === "Jogadora"
                      ? "border-primary-500 bg-primary-500/10"
                      : "border-primary-500/30 hover:border-primary-500/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="profile_type"
                    value="Jogadora"
                    checked={formData.profile_type === "Jogadora"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚽</div>
                    <div className="text-sm font-medium text-foreground">
                      Jogadora
                    </div>
                  </div>
                </label>

                <label
                  className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                    formData.profile_type === "Torcedor"
                      ? "border-primary-500 bg-primary-500/10"
                      : "border-primary-500/30 hover:border-primary-500/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="profile_type"
                    value="Torcedor"
                    checked={formData.profile_type === "Torcedor"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">📣</div>
                    <div className="text-sm font-medium text-foreground">
                      Torcedor
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Biografia
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                maxLength={200}
                className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                         placeholder-foreground-subtle transition-colors resize-none"
                placeholder="Conte um pouco sobre você..."
              />
              <p className="text-xs text-foreground-subtle mt-1">
                {formData.bio.length}/200 caracteres
              </p>
            </div>

            {/* Botão de submit */}
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.username ||
                !formData.full_name ||
                !formData.profile_type
              }
              loading={loading}
              className="w-full"
              size="large"
              variant="principal"
            >
              Finalizar Cadastro
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-foreground-subtle">
              Você poderá alterar essas informações a qualquer momento
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-xs text-foreground-subtle">
            © 2025 Elas No Jogo. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </main>
  );
}
