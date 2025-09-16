import React, { useState } from 'react';
import { 
  BsGrid3X3, 
  BsBookmark, 
  BsHeart,
  BsPersonVideo
} from "react-icons/bs";
import { IoLogOutOutline } from "react-icons/io5";
import Button from '../../components/Button';

const userData = {
  username: '@TaliahOliveira',
  name: 'Taliah Oliveira',
  avatarUrl: 'https://p2.trrsf.com/image/fget/cf/1200/1200/middle/images.terra.com/2023/07/21/1373710943-alisha-lehmann-aston-vila.jpg',
  following: 198,
  followers: 260,
  likes: 1910,
  bio: 'Me aventurando no mundo do futebol! ⚽️✨ #FutebolFeminino #GirlPower'
};

const videos = Array(12).fill(1); 

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('grid');

  return (
    <div className="bg-[#2D3142] text-white min-h-screen font-sans">
      <div className="max-w-4xl mx-auto p-4">

        {/* --- CABEÇALHO SUPERIOR --- */}
        <header className="flex justify-between items-center py-2">
          <h1 className="text-xl font-bold">{userData.username}</h1>
         <Button
          variant="transparente"
          size="small"
        >
          <span>Sair</span>
          <IoLogOutOutline size={18} />
        </Button>
        </header>

        {/* --- SEÇÃO PRINCIPAL DO PERFIL --- */}
        <section className="my-6">
          <div className="flex items-center">
            <img
              src={userData.avatarUrl}
              alt="Avatar do perfil"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1 flex justify-around items-center ml-4">
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
          </div>
          
          <div className="mt-4">
            <h2 className="font-semibold">{userData.name}</h2>
            <p className="text-neutral-300 text-sm">{userData.bio}</p>
          </div>
        </section>

        {/* --- BOTÕES DE AÇÃO --- */}
        <section className="flex items-center gap-2 mb-6">
          <button className="flex-1 bg-[#D48CF8] border border-neutral-700 font-semibold py-2 rounded-md text-sm">
            Editar perfil
          </button>
          <button className="flex-1 bg-[#03BB85] border border-neutral-700 font-semibold py-2 rounded-md text-sm">
            Seguir perfil
          </button>
  
        </section>

        {/* --- ABAS PARA NAVEGAÇÃO DE VÍDEOS --- */}
        <section className="flex border-t border-neutral-800">
          <button 
            onClick={() => setActiveTab('grid')}
            className={`flex-1 justify-center flex items-center py-3 ${activeTab === 'grid' ? 'border-b-2 border-white text-white' : 'text-neutral-500'}`}
          >
            <BsGrid3X3 size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 justify-center flex items-center py-3 ${activeTab === 'saved' ? 'border-b-2 border-white text-white' : 'text-neutral-500'}`}
          >
            <BsBookmark size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`flex-1 justify-center flex items-center py-3 ${activeTab === 'liked' ? 'border-b-2 border-white text-white' : 'text-neutral-500'}`}
          >
            <BsHeart size={20} />
          </button>
        </section>
        
        {/* --- GRADE DE VÍDEOS --- */}
        <main className="grid grid-cols-3 gap-0.5">
          {videos.map((_, index) => (
            <div key={index} className="relative aspect-square bg-neutral-800">
              <img 
                src={`https://picsum.photos/300/400?random=${index}`} 
                alt={`Vídeo ${index + 1}`}
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-1 left-1 flex items-center gap-1 text-xs">
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