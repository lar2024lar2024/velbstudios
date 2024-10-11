"use client"; // Marcar como Client Component

import { useState, useEffect } from 'react';
import { storage, db } from '../firebase'; // Certifique-se de que o Firebase Storage e Realtime Database estão configurados corretamente
import { ref as storageRef, deleteObject } from "firebase/storage";
import { ref as databaseRef, onValue, remove } from "firebase/database";

export default function VerPDFs() {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfs, setSelectedPdfs] = useState([]); // PDFs selecionados para exclusão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Paginação
  const pdfsPerPage = 6; // Número de PDFs por página

  useEffect(() => {
    const fetchPdfs = async () => {
      const pdfsRef = databaseRef(db, 'pdfs');
      onValue(pdfsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedData = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setPdfs(formattedData);
        } else {
          setPdfs([]);
        }
      });
    };

    fetchPdfs();
  }, []);

  // Abrir modal para visualizar o PDF
  const openModal = (url) => {
    setSelectedPdf(url);
    setIsModalOpen(true);
  };

  // Fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPdf(null);
  };

  // Selecionar ou desselecionar um PDF
  const handleCheckboxChange = (id) => {
    setSelectedPdfs((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // Selecionar todos os PDFs da página atual
  const handleSelectAll = () => {
    const currentPdfs = pdfsOnCurrentPage();
    if (selectedPdfs.length === currentPdfs.length) {
      setSelectedPdfs([]);
    } else {
      setSelectedPdfs(currentPdfs.map((pdf) => pdf.id));
    }
  };

  // Excluir os PDFs selecionados
  const deleteSelectedPdfs = async () => {
    if (window.confirm("Tem certeza que deseja excluir os PDFs selecionados?")) {
      for (let id of selectedPdfs) {
        try {
          const pdf = pdfs.find((p) => p.id === id);
          const pdfStorageRef = storageRef(storage, `pdfs/${pdf.name}`);
          const pdfDatabaseRef = databaseRef(db, `pdfs/${id}`);

          // Excluir do Firebase Storage e Realtime Database
          await deleteObject(pdfStorageRef);
          await remove(pdfDatabaseRef);

          // Atualiza a lista localmente
          setPdfs(pdfs.filter((p) => p.id !== id));
        } catch (error) {
          console.error("Erro ao excluir o PDF:", error.message);
        }
      }
      setSelectedPdfs([]);
    }
  };

  // Excluir todos os PDFs
  const deleteAllPdfs = async () => {
    if (window.confirm("Tem certeza que deseja excluir todos os PDFs?")) {
      for (let pdf of pdfs) {
        try {
          const pdfStorageRef = storageRef(storage, `pdfs/${pdf.name}`);
          const pdfDatabaseRef = databaseRef(db, `pdfs/${pdf.id}`);

          // Excluir do Firebase Storage e Realtime Database
          await deleteObject(pdfStorageRef);
          await remove(pdfDatabaseRef);
        } catch (error) {
          console.error("Erro ao excluir o PDF:", error.message);
        }
      }
      setPdfs([]);
    }
  };

  // Paginação
  const pdfsOnCurrentPage = () => {
    const startIndex = (currentPage - 1) * pdfsPerPage;
    const endIndex = startIndex + pdfsPerPage;
    return pdfs.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(pdfs.length / pdfsPerPage)) {
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
      <h1 className="text-3xl font-bold mb-8 text-purple-700">Lista de PDFs</h1>

      {pdfs.length === 0 ? (
        <p className="text-lg">Nenhum PDF encontrado.</p>
      ) : (
        <>
          {/* Botão para excluir os selecionados */}
          {selectedPdfs.length > 0 && (
            <button
              className="mb-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
              onClick={deleteSelectedPdfs}
            >
              Excluir Selecionados
            </button>
          )}

          {/* Botão para selecionar todos */}
          <div className="mb-4">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={selectedPdfs.length === pdfsOnCurrentPage().length}
            />
            <label className="ml-2">Selecionar todos</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfsOnCurrentPage().map((pdf, index) => (
              <div key={pdf.id} className="bg-white shadow-lg rounded-lg p-4 relative">
                <p className="text-sm text-gray-600 mt-2">
                  Enviado em: {new Date(pdf.timeUploaded).toLocaleString()}
                </p>
                <p className="text-sm text-purple-700">{pdf.name}</p>
                <input
                  type="checkbox"
                  className="absolute top-2 right-2"
                  onChange={() => handleCheckboxChange(pdf.id)}
                  checked={selectedPdfs.includes(pdf.id)}
                />
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full block text-center"
                >
                  Ver PDF
                </a>
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
            <p className="text-lg">{`Página ${currentPage} de ${Math.ceil(pdfs.length / pdfsPerPage)}`}</p>
            <button
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full"
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(pdfs.length / pdfsPerPage)}
            >
              Próxima
            </button>
          </div>

          {/* Botão para excluir todos os PDFs */}
          <button
            className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
            onClick={deleteAllPdfs}
          >
            Excluir Todos os PDFs
          </button>
        </>
      )}

      {/* Modal para visualizar PDF completo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg">
            <iframe
              src={selectedPdf}
              width="100%"
              height="600px"
              title="Visualização de PDF"
            />
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
