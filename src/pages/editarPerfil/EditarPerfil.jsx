import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../hooks/useUser";
import supabase from "../../lib/supabaseClient";
import DialogComponents from "../../components/DialogComponents";
import Button from "../../components/Button";
import LocationAutocomplete from "../../components/LocationAutocomplete";
import PositionSelect from "../../components/PositionSelect";
import ContactsEditor from "../../components/ContactsEditor";
import { replaceProfileContacts } from "../../lib/contactService";

export default function EditarPerfil() {
  const { user, setProfile, contacts, setContacts } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    profile_type: "",
    avatar_url: "",
    localizacao: "",
    posicao: "",
  });
  const [contactsDraft, setContactsDraft] = useState([]);
  const [contactsValid, setContactsValid] = useState(true); // novo estado
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          // Garante compatibilidade caso perfil antigo tenha usado 'location'
          setFormData((prev) => ({
            ...prev,
            username: data.username || "",
            full_name: data.full_name || "",
            bio: data.bio || "",
            profile_type: data.profile_type || "",
            avatar_url: data.avatar_url || "",
            localizacao: data.localizacao || data.location || "",
            posicao: data.posicao || "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      }
    };

    fetchProfile();
  }, [user]);

  // Inicializa contatos locais a partir do context quando abrir a tela
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      // acrescenta campo raw para edição de telefone/whatsapp sem perder formatação
      setContactsDraft(contacts.map((c) => ({ ...c, raw: c.url })));
    }
  }, [contacts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = {
        updated_at: new Date().toUTCString(),
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
        profile_type: formData.profile_type,
        avatar_url: formData.avatar_url,
        localizacao: formData.localizacao,
        posicao: formData.posicao,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", user.id);

      if (error) throw error;

      // Atualiza o contexto global do usuário
      setProfile((prev) => ({ ...prev, ...updatedProfile }));

      // salva contatos
      const savedContacts = await replaceProfileContacts(
        user.id,
        contactsDraft
      );
      setContacts(savedContacts);

      setIsDialogOpen(true);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  // Validação similar à CompleteProfile (sem data_nascimento pois não existe aqui)
  const isFormInvalid =
    loading ||
    !formData.username.trim() ||
    !formData.full_name.trim() ||
    !formData.profile_type ||
    formData.bio.length > 200 ||
    !contactsValid;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <DialogComponents
        isOpen={isDialogOpen}
        onClose={() => navigate("/perfil")}
        title="Perfil Atualizado!"
        description="Suas informações foram salvas com sucesso."
        btText2="Voltar ao Perfil"
        btAction02={() => navigate("/perfil")}
      />

      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-500 mb-4">
            Editar Perfil
          </h1>
          <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
            Mantenha suas informações sempre atualizadas.
          </p>
        </div>

        <div className="bg-background-light rounded-2xl p-6 md:p-8 shadow-xl border border-primary-500/20">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
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
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 12H20M12 4V20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
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
            </div>
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
                className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-foreground-subtle transition-colors"
                placeholder="@seuusername"
              />
            </div>

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
                className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-foreground-subtle transition-colors"
                placeholder="Seu nome completo"
              />
            </div>
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
                className="w-full bg-background border border-primary-500/30 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-foreground-subtle transition-colors resize-none"
                placeholder="Conte um pouco sobre você..."
              ></textarea>
              <p className="text-xs text-foreground-subtle mt-1">
                {formData.bio.length}/200 caracteres
              </p>
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Localização
              </label>
              <LocationAutocomplete
                value={formData.localizacao}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    localizacao: val,
                  }))
                }
                placeholder="Digite para buscar..."
              />
            </div>

            {/* Posição */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Posição
              </label>
              <PositionSelect
                value={formData.posicao}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    posicao: val,
                  }))
                }
              />
            </div>

            {/* Contatos */}
            <div>
              <ContactsEditor
                value={contactsDraft}
                onChange={setContactsDraft}
                max={3}
                onValidityChange={setContactsValid}
              />
            </div>

            <div className="flex flex-col gap-4 items-center">
              <Button
                type="submit"
                disabled={isFormInvalid}
                loading={loading}
                className="w-full"
                size="large"
                variant="principal"
              >
                Salvar Alterações
              </Button>
              <Button
                variant="cancelar"
                size="medium"
                className="w-40"
                onClick={() => navigate("/perfil")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
