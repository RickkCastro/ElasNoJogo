import { useEffect, useState } from "react";
import { useVideoUpload, useVideos } from "../hooks/useVideo.js";
import { formatDuration, formatViews } from "../lib/videoConfig.js";

// Componente de upload de vídeo
export const VideoUploadExample = () => {
  const { uploading, error, uploadVideo } = useVideoUpload();

  // Manipula seleção de arquivo e faz upload
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = await uploadVideo(file, {
      title: "Meu vídeo",
      description: "Descrição do vídeo",
    });
    if (result.success) {
      alert("Vídeo enviado com sucesso!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload de Vídeo</h2>
      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <p>Enviando vídeo...</p>}
      {error && <p style={{ color: "red" }}>Erro: {error}</p>}
    </div>
  );
};

// Componente para listar vídeos
export const VideoListExample = () => {
  const { videos, loading, error, loadVideos } = useVideos();
  const [hasLoaded, setHasLoaded] = useState(false);

  // Carrega vídeos apenas uma vez
  useEffect(() => {
    if (!hasLoaded) {
      loadVideos(0);
      setHasLoaded(true);
    }
  }, [hasLoaded, loadVideos]);

  const handleRefresh = () => {
    setHasLoaded(false);
  };

  if (loading && !hasLoaded) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Carregando vídeos...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <p style={{ color: "red" }}>Erro: {error}</p>
        <button onClick={handleRefresh}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Lista de Vídeos ({videos.length})</h2>
        <button onClick={handleRefresh}>Atualizar</button>
      </div>
      {videos.length === 0 ? (
        <p>Nenhum vídeo encontrado. Faça upload do primeiro vídeo!</p>
      ) : (
        <div>
          {videos.map((video) => (
            <div
              key={video.id}
              style={{
                marginBottom: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>{video.title || "Sem título"}</h3>
              <p>{video.description || "Sem descrição"}</p>
              <video
                src={video.video_url}
                poster={video.thumbnail_url}
                controls
                width="300"
                height="200"
                style={{ borderRadius: "4px" }}
                // Erro de carregamento pode ser tratado na UI se necessário
              />
              <div
                style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}
              >
                <span>⏱️ {formatDuration(video.duration || 0)} | </span>
                <span>👁️ {formatViews(video.views_count || 0)} visualizações | </span>
                <span>❤️ {video.likes_count || 0} likes</span>
              </div>
              <div
                style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}
              >
                Criado em: {new Date(video.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Página de teste com abas para upload e listagem
export const VideoTestPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  return (
    <div style={{ padding: "20px" }}>
      <nav style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("upload")}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: activeTab === "upload" ? "#007bff" : "#f8f9fa",
            color: activeTab === "upload" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab("list")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "list" ? "#007bff" : "#f8f9fa",
            color: activeTab === "list" ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Lista
        </button>
      </nav>
      {activeTab === "upload" && <VideoUploadExample />}
      {activeTab === "list" && <VideoListExample />}
    </div>
  );
};
