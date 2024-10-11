import Link from 'next/link';

export default function GerenciarGincana() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-purple-700">Gerenciar Gincana</h1>
      
      <div className="space-y-4">
        <Link href="/ver-banners">
          <button className="w-64 bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300">
            Ver Banners
          </button>
        </Link>

        <Link href="/ver-pdfs">
          <button className="w-64 bg-yellow-400 hover:bg-yellow-500 text-purple-700 font-bold py-2 px-4 rounded-full transition-colors duration-300">
            Ver PDFs
          </button>
        </Link>
      </div>
    </div>
  );
}
