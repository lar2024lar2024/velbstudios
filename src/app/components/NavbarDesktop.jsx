import Link from 'next/link';
import { FaHome, FaFilePdf, FaImage, FaCogs } from 'react-icons/fa';

export default function NavbarDesktop() {
  return (
    <nav className="bg-yellow-400 p-4 text-purple-700 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto">
        <ul className="flex justify-center space-x-6">
          <li className="flex items-center">
            <FaHome className="mr-2" />
            <Link href="/" className="hover:text-white transition-colors duration-300">
              Home
            </Link>
          </li>
          <li className="flex items-center">
            <FaFilePdf className="mr-2" />
            <Link href="/enviar-pdf" className="hover:text-white transition-colors duration-300">
              Enviar PDF
            </Link>
          </li>
          <li className="flex items-center">
            <FaImage className="mr-2" />
            <Link href="/enviar-banner" className="hover:text-white transition-colors duration-300">
              Enviar Banner
            </Link>
          </li>
          <li className="flex items-center">
            <FaCogs className="mr-2" />
            <Link href="/gerenciar-gincana" className="hover:text-white transition-colors duration-300">
              Gerenciar Gincana
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
