"use client"; // Marcando o componente como Client Component

import { useState } from 'react';
import { storage, db } from '../firebase'; // Certifique-se de que o Firebase Storage e Realtime Database estão configurados corretamente
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref as databaseRef, push, set } from "firebase/database"; // Importando métodos do Realtime Database

export default function EnviarBanner() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      alert("Por favor, selecione um banner para enviar.");
      return;
    }

    const storageReference = storageRef(storage, `banners/${file.name}`);
    const uploadTask = uploadBytesResumable(storageReference, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Erro ao enviar o banner:", error);
      },
      () => {
        // Após o upload, obtenha a URL do banner
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploadedUrl(downloadURL);
          setShowSuccessMessage(true);

          // Enviar URL para o Realtime Database
          const bannersRef = databaseRef(db, 'banners'); // Referência para o nó 'banners'
          const newBannerRef = push(bannersRef); // Criar um novo item no nó 'banners'

          // Usar 'set' diretamente com a referência gerada por 'push'
          set(newBannerRef, {
            url: downloadURL,
            name: file.name,
            timeUploaded: new Date().toISOString(), // Armazena a data e hora do envio
          });

          // Esconde a mensagem de sucesso após 5 segundos
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 5000);
        });
      }
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">Enviar Banner</h1>
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="text-gray-700">Selecione o Banner (imagem):</span>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-100 file:text-purple-700
              hover:file:bg-purple-200"
              onChange={handleFileChange}
            />
          </label>
          <button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
          >
            Enviar
          </button>
        </form>

        {/* Exibe o progresso do upload */}
        {uploadProgress > 0 && (
          <div className="mt-4">
            <p>Progresso do upload: {uploadProgress.toFixed(2)}%</p>
          </div>
        )}

        {/* Exibe a URL do banner enviado com estilo */}
        {showSuccessMessage && (
          <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <h2 className="font-bold">Banner enviado com sucesso!</h2>
            <p className="mt-2">Seu banner foi enviado e pode ser visualizado abaixo:</p>
            {uploadedUrl && (
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-purple-700 font-semibold hover:underline"
              >
                Ver Banner
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
