import { useEffect, useState } from "react";
import { useVideoUpload } from "../../hooks/useVideo";
import DialogComponents from "../../components/DialogComponents";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import useUser from "../../hooks/useUser";
import LocationAutocomplete from "../../components/LocationAutocomplete";

export default function Postar() {
    let navigate = useNavigate();
    const { profile } = useUser();

    useEffect(() => {
        if (profile.profile_type !== "Jogadora") {
            navigate("/");
        }
    }, [profile, navigate]);

    const { uploading, error, uploadVideo } = useVideoUpload();

    const [form, setForm] = useState({
        file: null,
        title: "",
        description: "",
        location: "",
    });

    const [videoPreview, setVideoPreview] = useState(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
            const file = files[0];
            setForm((prev) => ({ ...prev, file }));
            setVideoPreview(file ? URL.createObjectURL(file) : null);
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.file) return;
        const result = await uploadVideo(form.file, {
            title: form.title,
            description: form.description,
            location: form.location,
        });
        if (result.success) {
            setIsDialogOpen(true);
            setForm({ file: null, title: "", description: "", location: "" });
            setVideoPreview(null);
        }
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        navigate("/");
    };

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
            <DialogComponents
                isOpen={isDialogOpen}
                onClose={handleDialogClose}
                title="Vídeo enviado!"
                description="Seu vídeo foi postado com sucesso."
                btText2="OK"
                btAction02={handleDialogClose}
            />
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-500 mb-4">
                        Postar Vídeo
                    </h1>
                    <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
                        Compartilhe seu momento com a comunidade!
                    </p>
                </div>
                <div className="bg-background-light rounded-2xl p-6 md:p-8 shadow-xl border border-primary-500/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Upload de vídeo */}
                        <div className="text-center">
                            {videoPreview ? (
                                <>
                                    <video
                                        src={videoPreview}
                                        controls
                                        className="w-full rounded-xl mb-2 border-2 border-primary-500/30"
                                        style={{ maxHeight: 220 }}
                                    />
                                    <label
                                        htmlFor="video-upload"
                                        className="inline-flex items-center gap-2 mt-2 cursor-pointer px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-foreground rounded-xl shadow transition-colors text-sm font-medium"
                                    >
                                        <svg
                                            className="w-5 h-5 text-foreground-muted"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M12 16v-8m-4 4h8"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <rect
                                                x="3"
                                                y="3"
                                                width="18"
                                                height="18"
                                                rx="4"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                fill="none"
                                            />
                                        </svg>
                                        Trocar vídeo
                                        <input
                                            id="video-upload"
                                            type="file"
                                            name="file"
                                            accept="video/mp4,video/webm,video/quicktime"
                                            onChange={handleChange}
                                            className="hidden"
                                            required={!videoPreview}
                                            disabled={uploading}
                                        />
                                    </label>
                                </>
                            ) : (
                                <label
                                    htmlFor="video-upload"
                                    className="relative block cursor-pointer"
                                >
                                    <div className="w-full h-32 flex items-center justify-center bg-background rounded-xl border-2 border-primary-500/30 mb-2">
                                        <span className="text-foreground-muted">
                                            Prévia do vídeo
                                        </span>
                                        <div className="absolute bottom-4 right-4 bg-secondary-500 hover:bg-secondary-600 text-foreground rounded-full p-3 shadow-lg transition-colors flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-foreground-muted"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    d="M12 16v-8m-4 4h8"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <rect
                                                    x="3"
                                                    y="3"
                                                    width="18"
                                                    height="18"
                                                    rx="4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    fill="none"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <input
                                        id="video-upload"
                                        type="file"
                                        name="file"
                                        accept="video/mp4,video/webm,video/quicktime"
                                        onChange={handleChange}
                                        className="hidden"
                                        required
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                            <p className="text-xs text-foreground-subtle mt-3">
                                {videoPreview
                                    ? 'Clique em "Trocar vídeo" para selecionar outro arquivo'
                                    : "Clique na prévia para selecionar o vídeo"}
                                <br />
                                Formatos aceitos: MP4, WebM, QuickTime. Máx:
                                60s, 50MB.
                            </p>
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
                                disabled={uploading}
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
                                disabled={uploading}
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
                                onChange={(val) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        location: val,
                                    }))
                                }
                                placeholder="Digite para buscar..."
                            />
                        </div>
                        {/* Botão de submit */}
                        <div className="flex flex-col gap-4 items-center">
                            <Button
                                type="submit"
                                disabled={
                                    uploading || !form.file || !form.title
                                }
                                loading={uploading}
                                className="w-full"
                                size="large"
                                variant="principal"
                            >
                                Postar Vídeo
                            </Button>
                            <Button
                                className="w-full"
                                size="large"
                                variant="cancelar"
                                onClick={() => navigate("/")}
                                disabled={uploading}
                            >
                                Cancelar
                            </Button>
                        </div>
                        {error && (
                            <div className="text-center text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                    </form>
                </div>
                <footer className="text-center mt-8">
                    <p className="text-xs text-foreground-subtle">
                        © 2025 Elas No Jogo. Todos os direitos reservados.
                    </p>
                </footer>
            </div>
        </main>
    );
}
