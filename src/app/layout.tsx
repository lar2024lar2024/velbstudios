import './globals.css'; // Estilos globais
import { ReactNode } from 'react';
import ClientNavbar from './components/ClientNavbar'; // Importando o novo componente ClientNavbar

export const metadata = {
  title: 'Painel Admin MV',
  description: 'Painel administrativo para gerenciar gincanas',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body> 
        <ClientNavbar /> {/* A Navbar será renderizada com base no tamanho da tela */}
        {children} {/* Renderiza o conteúdo da página */}
      </body>
    </html>
  );
}
