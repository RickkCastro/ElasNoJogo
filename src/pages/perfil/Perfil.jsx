import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from "../../hooks/useUser";
import supabase from "../../lib/supabaseClient";
import Button from '../../components/Button.jsx'; 
import { 
  BsGrid3X3, 
  BsBookmark, 
  BsHeart,
  BsPersonVideo
} from "react-icons/bs";
import { IoLogOutOutline } from "react-icons/io5";

const videos = Array(12).fill(1); 

export default function ProfileScreen() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
      username: "",
      full_name: "",
      bio: "",
      profile_type: "",
      avatar_url: "",
    });

  const [activeTab, setActiveTab] = useState('grid');

  useEffect(() => {
      const fetchProfile = async () => {
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("username, full_name, bio, profile_type, avatar_url")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          if (data) {
            setFormData(data);
          }
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
        }
      };

      fetchProfile();
    }, [user]);

  const userData = {
    username: user?.username,
    name: user?.full_name,
    avatarUrl: user?.avatar_url,
    following: user?.following ?? 0,
    followers: user?.followers ?? 0,
    likes: user?.likes ?? 0,
    bio: user?.bio
  };

  const handleLogout = async () => {
    console.log("Saindo...");
    await supabase.auth.signOut();
    navigate('/'); 
  };

  if (!user) {
    return (
      <div className="bg-[#21212B] text-white min-h-screen flex items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#21212B] text-white min-h-screen font-sans"> 
      <div className="max-w-4xl mx-auto p-4">

        {/* --- CABEÇALHO SUPERIOR --- */}
        <header className="flex justify-between items-center py-2 px-4">
          <h1 className="text-xl font-bold">{formData.username}</h1>
          <Button
            variant="transparente"
            size="small"
            onClick={handleLogout}
            className="flex items-center gap-1 text-neutral-300 hover:text-red-500" 
          >
            <span className="font-semibold text-base">Sair</span>
            <IoLogOutOutline size={20} />
          </Button>
        </header>

        {/* --- SEÇÃO PRINCIPAL DO PERFIL --- */}
        <section className="flex flex-col items-center my-8 px-4"> 
          <img
            src={formData.avatar_ur}
            alt="Avatar do perfil"
            className="w-28 h-28 rounded-full object-cover border-2 border-transparent" 
          />
          
          {/* Estatísticas */}
          <div className="flex justify-center items-center gap-6 mt-6 text-base">
              <div className="text-center">
                <span className="font-bold text-lg">{userData.following}</span>
                <p className="text-sm text-neutral-400">Seguindo</p>
              </div>
              <div className="text-center">
                <span className="font-bold text-lg">{userData.followers}</span>
                <p className="text-sm text-neutral-400">Seguidores</p>
              </div>
              <div className="text-center">
                <span className="font-bold text-lg">{userData.likes}</span>
                <p className="text-sm text-neutral-400">Curtidas</p>
              </div>
          </div>
          
          {/* Nome e Bio */}
          <div className="mt-6 text-center">
            <h2 className="font-semibold text-lg">{formData.full_name}</h2>
            <p className="text-neutral-300 text-sm max-w-sm mt-1">{formData.bio}</p>
          </div>
        </section>

        {/* --- BOTÕES DE AÇÃO --- */}
        <section className="flex items-center gap-3 mb-6 px-4">
          <Button 
            variant="principal" 
            size="medium" 
            className="flex-1 py-3"
            onClick={() => navigate('/editar-perfil')}>
            Editar perfil
          </Button>
          <Button variant="secundario" size="medium" className="flex-1 py-3">
            Seguir perfil
          </Button>
        </section>

        {/* --- ABAS PARA NAVEGAÇÃO DE VÍDEOS --- */}
        <section className="flex border-t border-b border-neutral-700 mt-4">
          <button 
            onClick={() => setActiveTab('grid')}
            className={`flex-1 justify-center flex items-center py-3 text-neutral-400 transition-colors duration-200 
                        ${activeTab === 'grid' ? 'border-b-2 border-white text-white' : ''} -mb-px`}
          >
            <BsGrid3X3 size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 justify-center flex items-center py-3 text-neutral-400 transition-colors duration-200 
                        ${activeTab === 'saved' ? 'border-b-2 border-white text-white' : ''} -mb-px`}
          >
            <BsBookmark size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`flex-1 justify-center flex items-center py-3 text-neutral-400 transition-colors duration-200 
                        ${activeTab === 'liked' ? 'border-b-2 border-white text-white' : ''} -mb-px`}
          >
            <BsHeart size={20} />
          </button>
        </section>
        
        {/* --- GRADE DE VÍDEOS --- */}
        <main className="grid grid-cols-3 gap-0.5 mt-0.5">
          {videos.map((_, index) => (
            <div key={index} className="relative aspect-square bg-neutral-800">
              <img 
                src={`https://picsum.photos/300/300?random=${index}`} 
                alt={`Foto aleatória ${index + 1}`}
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-1 left-1 flex items-center gap-1 text-xs bg-black bg-opacity-50 px-1 rounded">
                <BsPersonVideo />
                <span>1.2M</span>
              </div>
            </div>
          ))}
        </main>

      </div>
    </div>
  );
}