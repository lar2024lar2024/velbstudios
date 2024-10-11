"use client"; // Este componente será um Client Component

import { useState, useEffect } from 'react';
import NavbarDesktop from './NavbarDesktop'; // Importando Navbar para desktop
import NavbarMobile from './NavbarMobile'; // Importando Navbar para mobile

export default function ClientNavbar() {
  const [isMobile, setIsMobile] = useState(false);

  // Verifica o tamanho da tela para decidir qual Navbar renderizar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Define mobile se a largura for menor que 768px
    };

    // Adiciona um listener para verificar o redimensionamento da janela
    window.addEventListener('resize', handleResize);
    handleResize(); // Executa a verificação ao carregar a página

    // Limpa o listener ao desmontar o componente
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <NavbarMobile /> : <NavbarDesktop />;
}
