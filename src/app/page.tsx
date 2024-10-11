import Usuarios from './components/Usuarios'; // Importando o componente da lista de usuários

export default function Home() {
  return (
    <div className="pt-16"> {/* Adiciona um padding no topo para evitar que o conteúdo fique escondido */}
  
      <Usuarios /> {/* Exibindo a lista de usuários diretamente na Home */}
    </div>
  );
}
