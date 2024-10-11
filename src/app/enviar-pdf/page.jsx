"use client"; // Marcando o componente como Client Component

import { useState } from 'react';
import { storage, db } from '../firebase'; // Certifique-se de que o Firebase Storage e Realtime Database estão configurados corretamente
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref as databaseRef, push, set } from "firebase/database";

export default function EnviarPDF() {
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
      alert("Por favor, selecione um PDF para enviar.");
      return;
    }

    const storageRef = ref(storage, `pdfs/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Erro ao enviar o PDF:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploadedUrl(downloadURL);
          setShowSuccessMessage(true); // Exibe a mensagem de sucesso

          // Salva no Realtime Database
          const pdfsRef = databaseRef(db, 'pdfs');
          const newPdfRef = push(pdfsRef); // Cria uma nova referência no nó 'pdfs'
          set(newPdfRef, {
            url: downloadURL,
            name: file.name,
            timeUploaded: new Date().toISOString(), // Salva a data e hora de envio
          });

          // Esconde a mensagem após 5 segundos
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
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">Enviar PDF</h1>
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="text-gray-700">Selecione o PDF:</span>
            <input
              type="file"
              accept="application/pdf"
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

        {/* Exibe a mensagem de sucesso e o link para o PDF */}
        {showSuccessMessage && (
          <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <h2 className="font-bold">PDF enviado com sucesso!</h2>
            <p className="mt-2">Seu PDF foi enviado e pode ser visualizado abaixo:</p>
            {uploadedUrl && (
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-purple-700 font-semibold hover:underline"
              >
                Ver PDF
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
