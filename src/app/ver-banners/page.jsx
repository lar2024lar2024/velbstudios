"use client"; // Marcar como Client Component

import { useState, useEffect } from 'react';
import { storage, db } from '../firebase'; // Certifique-se de que o Firebase Storage e Firestore estão configurados corretamente
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, doc, updateDoc, getDocs, deleteDoc } from "firebase/firestore"; // Importando funções do Firestore

export default function VerBanners() {
  const [banners, setBanners] = useState([]);
  const [selectedBannerForReplace, setSelectedBannerForReplace] = useState(null);
  const [newFile, setNewFile] = useState(null); // Novo banner para upload
  const [uploadProgress, setUploadProgress] = useState(0); // Progresso do upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Paginação
  const bannersPerPage = 6; // Número de banners por página

  // Função para buscar banners do Firestore
  useEffect(() => {
    const fetchBanners = async () => {
      const bannersRef = collection(db, 'banners');
      const querySnapshot = await getDocs(bannersRef);
      const bannersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBanners(bannersData);
    };

    fetchBanners();
  }, []);

  // Função para selecionar o banner a ser substituído
  const handleBannerReplace = (banner) => {
    setSelectedBannerForReplace(banner);
  };

  // Função para selecionar o novo arquivo (banner) para upload
  const handleNewFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  // Função para substituir o banner no Firebase Storage e atualizar no Firestore
  const replaceBanner = async () => {
    if (!newFile || !selectedBannerForReplace) {
      alert("Selecione um banner e um novo arquivo.");
      return;
    }

    const confirmReplace = window.confirm("Tem certeza que deseja substituir este banner?");
    if (confirmReplace) {
      try {
        const oldBannerStorageRef = storageRef(storage, `banners/${selectedBannerForReplace.name}`);
        const newBannerStorageRef = storageRef(storage, `banners/${newFile.name}`);

        // Upload do novo banner
        const uploadTask = uploadBytesResumable(newBannerStorageRef, newFile);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Erro ao enviar o novo banner:", error);
          },
          async () => {
            // Obter URL do novo banner após o upload
            const newBannerUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // Atualizar o banner no Firestore
            const bannerDocRef = doc(db, 'banners', selectedBannerForReplace.id);
            await updateDoc(bannerDocRef, {
              url: newBannerUrl,
              name: newFile.name,
              timeUploaded: new Date().toISOString(), // Armazena a data e hora do envio
            });

            // Excluir o banner antigo do Firebase Storage
            await deleteObject(oldBannerStorageRef);

            alert("Banner substituído com sucesso!");
            setSelectedBannerForReplace(null);
            setNewFile(null);
          }
        );
      } catch (error) {
        console.error("Erro ao substituir o banner:", error);
      }
    }
  };

  // Abrir modal para visualizar o banner completo
  const openModal = (url) => {
    setSelectedBanner(url);
    setIsModalOpen(true);
  };

  // Fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
  };

  // Paginação
  const bannersOnCurrentPage = () => {
    const startIndex = (currentPage - 1) * bannersPerPage;
    const endIndex = startIndex + bannersPerPage;
    return banners.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(banners.length / bannersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-purple-700">Lista de Banners</h1>

      {banners.length === 0 ? (
        <p className="text-lg">Nenhum banner encontrado.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bannersOnCurrentPage().map((banner) => (
              <div key={banner.id} className="bg-white shadow-lg rounded-lg p-4 relative">
                <img
                  src={banner.url}
                  alt={`Banner ${banner.name}`}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => openModal(banner.url)}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Enviado em: {new Date(banner.timeUploaded).toLocaleString()}
                </p>

                {/* Botão para substituir o banner */}
                <button
                  className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full"
                  onClick={() => handleBannerReplace(banner)}
                >
                  Substituir Banner
                </button>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="mt-8 flex justify-between items-center w-full max-w-md">
            <button
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <p className="text-lg">{`Página ${currentPage} de ${Math.ceil(banners.length / bannersPerPage)}`}</p>
            <button
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full"
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(banners.length / bannersPerPage)}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {/* Formulário de Substituição de Banner */}
      {selectedBannerForReplace && (
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Substituir Banner: {selectedBannerForReplace.name}</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleNewFileChange}
            className="mb-4"
          />
          {newFile && (
            <>
              <p>Arquivo selecionado: {newFile.name}</p>
              <button
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full"
                onClick={replaceBanner}
              >
                Confirmar Substituição
              </button>
              {/* Exibe o progresso do upload */}
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <p>Progresso do upload: {uploadProgress.toFixed(2)}%</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal para visualizar banner completo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg">
            <img src={selectedBanner} alt="Banner Completo" className="max-w-full h-auto" />
            <button
              className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full"
              onClick={closeModal}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
