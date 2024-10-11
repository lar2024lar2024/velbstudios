'use client'; // Marca o componente como Client Component

import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase'; // Certifique-se de que o Firebase está configurado corretamente

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [usersPerPage] = useState(10); // Número de usuários por página

  const [selectedUser, setSelectedUser] = useState(null); // Armazena o usuário selecionado
  const [showModal, setShowModal] = useState(false); // Controle do modal

  useEffect(() => {
    const usersRef = ref(db, 'inscricoesGincana'); // Ref para sua coleção no Firebase
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setUsers(formattedData); // Atualiza o estado com os usuários
      }
    });
  }, []);

  // Função para abrir o modal com os detalhes completos
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Lógica de paginação
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser); // Usuários da página atual

  const totalPages = Math.ceil(users.length / usersPerPage); // Número total de páginas

  // Função para mudar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuários</h1>
      <table className="table-auto w-full text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Apelido</th>
            <th className="p-2">Nome Completo</th>
            <th className="p-2">Grupo</th>
            <th className="p-2">Igreja</th>
            <th className="p-2">Líder do Grupo</th>
            <th className="p-2">Localidade</th>
            <th className="p-2">WhatsApp</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr
              key={user.id}
              className="border-b cursor-pointer hover:bg-gray-100"
              onClick={() => handleUserClick(user)} // Abre o modal ao clicar em qualquer linha
            >
              <td className="p-2">{user.apelido}</td>
              <td className="p-2 font-bold text-lg text-purple-700 truncate max-w-xs">
                {user.nomeCompleto}
              </td>
              <td className="p-2 truncate max-w-xs">{user.nomeGrupo}</td>
              <td className="p-2 truncate max-w-xs">{user.igreja}</td>
              <td className="p-2 truncate max-w-xs">{user.liderGrupo}</td>
              <td className="p-2 truncate max-w-xs">{user.localidade}</td>
              <td className="p-2">{user.whatsapp}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`px-3 py-1 mx-1 ${
              currentPage === index + 1
                ? 'bg-purple-700 text-white'
                : 'bg-gray-300 hover:bg-gray-400'
            } rounded`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {/* Modal para exibir os detalhes completos */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">{selectedUser.nomeCompleto}</h2>
            <p><strong>Apelido:</strong> {selectedUser.apelido}</p>
            <p><strong>Grupo:</strong> {selectedUser.nomeGrupo}</p>
            <p><strong>Igreja:</strong> {selectedUser.igreja}</p>
            <p><strong>Líder do Grupo:</strong> {selectedUser.liderGrupo}</p>
            <p><strong>Localidade:</strong> {selectedUser.localidade}</p>
            <p><strong>WhatsApp:</strong> {selectedUser.whatsapp}</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
