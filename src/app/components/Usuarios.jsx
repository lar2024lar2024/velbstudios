"use client"; // Marca o componente como Client Component

import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database"; // Realtime Database
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"; // Firestore
import { db as firestoreDb, realtimeDb } from "../firebase"; // Certifique-se de que o Firebase está configurado corretamente

export default function Usuarios() {
  const [usersFirestore, setUsersFirestore] = useState([]); // Usuários do Firestore
  const [usersRealtime, setUsersRealtime] = useState([]); // Usuários do Realtime Database
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [usersPerPage] = useState(10); // Número de usuários por página
  const [selectedUser, setSelectedUser] = useState(null); // Armazena o usuário selecionado
  const [selectedUsers, setSelectedUsers] = useState([]); // Armazena os IDs dos usuários selecionados
  const [showModal, setShowModal] = useState(false); // Controle do modal

  useEffect(() => {
    // Função para carregar dados do Firestore
    const fetchFirestoreUsers = async () => {
      try {
        const usersRef = collection(firestoreDb, "inscricoesGincana"); // Coleção no Firestore
        const snapshot = await getDocs(usersRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsersFirestore(data);
      } catch (error) {
        console.error("Erro ao buscar usuários no Firestore:", error);
      }
    };

    // Função para carregar dados do Realtime Database
    const fetchRealtimeUsers = () => {
      const usersRef = ref(realtimeDb, "inscricoesGincana"); // Referência no Realtime Database
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedData = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setUsersRealtime(formattedData);
        }
      });
    };

    // Chama ambas as funções de carregamento
    fetchFirestoreUsers();
    fetchRealtimeUsers();
  }, []);

  // Função para abrir o modal com os detalhes completos
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true); // Abre o modal
  };

  // Função para fechar o modal
  const closeModal = () => {
    setShowModal(false); // Fecha o modal
    setSelectedUser(null);
  };

  // Lógica de paginação combinando dados do Firestore e Realtime Database
  const allUsers = [...usersFirestore, ...usersRealtime]; // Combina usuários de ambas as bases
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser); // Usuários da página atual

  const totalPages = Math.ceil(allUsers.length / usersPerPage); // Número total de páginas

  // Função para mudar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Função para selecionar/deselecionar um usuário
  const handleCheckboxChange = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Função para selecionar todos os usuários da página atual
  const handleSelectAll = () => {
    const allSelected = currentUsers.every((user) => selectedUsers.includes(user.id));
    if (allSelected) {
      setSelectedUsers(selectedUsers.filter((id) => !currentUsers.some((user) => user.id === id)));
    } else {
      setSelectedUsers([...selectedUsers, ...currentUsers.map((user) => user.id)]);
    }
  };

  // Função para excluir os usuários selecionados
  const handleDeleteSelected = async () => {
    if (window.confirm("Tem certeza que deseja excluir os usuários selecionados?")) {
      for (const userId of selectedUsers) {
        try {
          // Exclui do Firestore e do Realtime Database
          await deleteDoc(doc(firestoreDb, "inscricoesGincana", userId));
          await remove(ref(realtimeDb, `inscricoesGincana/${userId}`));
        } catch (error) {
          console.error("Erro ao excluir o usuário:", error);
        }
      }
      setSelectedUsers([]); // Limpa a seleção após a exclusão
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuários</h1>

      {/* Botão de exclusão para os usuários selecionados */}
      {selectedUsers.length > 0 && (
        <button
          className="mb-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleDeleteSelected}
        >
          Excluir Selecionados
        </button>
      )}

      <table className="table-auto w-full text-center">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-sm">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={currentUsers.every((user) => selectedUsers.includes(user.id))}
              />
            </th>
            <th className="p-2 text-sm">Apelido</th>
            <th className="p-2 text-sm">Nome Completo</th>
            <th className="p-2 text-sm">Igreja/Grupo</th>
            <th className="p-2 text-sm">WhatsApp</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr
              key={user.id}
              className="border-b cursor-pointer hover:bg-gray-100 text-sm"
            >
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
              </td>
              <td className="p-2">{user.apelido}</td>
              <td className="p-2 font-bold text-purple-700 truncate max-w-xs" title={user.nomeCompleto}>
                {user.nomeCompleto.length > 20 ? user.nomeCompleto.slice(0, 20) + "..." : user.nomeCompleto}
              </td>
              <td className="p-2 truncate max-w-xs" title={`${user.igreja} / ${user.nomeGrupo}`}>
                {user.igreja} / {user.nomeGrupo}
              </td>
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
              currentPage === index + 1 ? "bg-purple-700 text-white" : "bg-gray-300 hover:bg-gray-400"
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
            <p><strong>Igreja:</strong> {selectedUser.igreja}</p>
            <p><strong>Grupo:</strong> {selectedUser.nomeGrupo}</p>
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
