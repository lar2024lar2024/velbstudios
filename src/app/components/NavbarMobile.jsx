"use client"; // Isso indica que o componente é um Client Component

import Link from 'next/link';
import { FaHome, FaFilePdf, FaImage } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; // Use "next/navigation" no app directory (Next.js 13)

export default function NavbarMobile() {
  const router = useRouter();

  return (
    <nav className="bg-yellow-400 fixed bottom-0 left-0 w-full z-50 p-2">
      <ul className="flex justify-around items-center">
        <li>
          <Link href="/">
            <div className={`flex flex-col items-center ${router.pathname === '/' ? 'text-purple-700' : 'text-gray-600'} transition-colors duration-300`}>
              <FaHome size={24} />
              <span className="text-xs">Home</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/enviar-pdf">
            <div className={`flex flex-col items-center ${router.pathname === '/enviar-pdf' ? 'text-purple-700' : 'text-gray-600'} transition-colors duration-300`}>
              <FaFilePdf size={24} />
              <span className="text-xs">Enviar PDF</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/enviar-banner">
            <div className={`flex flex-col items-center ${router.pathname === '/enviar-banner' ? 'text-purple-700' : 'text-gray-600'} transition-colors duration-300`}>
              <FaImage size={24} />
              <span className="text-xs">Enviar Banner</span>
            </div>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
