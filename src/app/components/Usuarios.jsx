"use client"; // Marca o componente como Client Component

import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db as firestoreDb, realtimeDb } from "../firebase";

export default function Usuarios() {
  const [usersFirestore, setUsersFirestore] = useState([]);
  const [usersRealtime, setUsersRealtime] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFirestoreUsers = async () => {
      try {
        const usersRef = collection(firestoreDb, "inscricoesGincana");
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

    const fetchRealtimeUsers = () => {
      const usersRef = ref(realtimeDb, "inscricoesGincana");
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

    fetchFirestoreUsers();
    fetchRealtimeUsers();
  }, []);

  const filteredUsers = [...usersFirestore, ...usersRealtime].filter((user) =>
    user.apelido.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.nomeCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.igreja.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.nomeGrupo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCheckboxChange = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    const allSelected = currentUsers.every((user) =>
      selectedUsers.includes(user.id)
    );
    if (allSelected) {
      setSelectedUsers(
        selectedUsers.filter((id) => !currentUsers.some((user) => user.id === id))
      );
    } else {
      setSelectedUsers([...selectedUsers, ...currentUsers.map((user) => user.id)]);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm("Tem certeza que deseja excluir os usuários selecionados?")) {
      for (const userId of selectedUsers) {
        try {
          await deleteDoc(doc(firestoreDb, "inscricoesGincana", userId));
          await remove(ref(realtimeDb, `inscricoesGincana/${userId}`));
        } catch (error) {
          console.error("Erro ao excluir o usuário:", error);
        }
      }
      setSelectedUsers([]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuários</h1>

      <input
        type="text"
        placeholder="Buscar por apelido, nome, igreja ou grupo"
        className="p-2 mb-4 border border-gray-300 rounded"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

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
                checked={currentUsers.every((user) =>
                  selectedUsers.includes(user.id)
                )}
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
              onClick={() => handleUserClick(user)}
            >
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="p-2">{user.apelido}</td>
              <td
                className="p-2 font-bold text-purple-700 truncate max-w-xs"
                title={user.nomeCompleto}
              >
                {user.nomeCompleto.length > 20
                  ? user.nomeCompleto.slice(0, 20) + "..."
                  : user.nomeCompleto}
              </td>
              <td
                className="p-2 truncate max-w-xs"
                title={`${user.igreja} / ${user.nomeGrupo}`}
              >
                {user.igreja} / {user.nomeGrupo}
              </td>
              <td className="p-2">{user.whatsapp}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
                ? "bg-purple-700 text-white"
                : "bg-gray-300 hover:bg-gray-400"
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

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedUser.nomeCompleto}
            </h2>
            <p>
              <strong>Apelido:</strong> {selectedUser.apelido}
            </p>
            <p>
              <strong>Igreja:</strong> {selectedUser.igreja}
            </p>
            <p>
              <strong>Nome do Grupo:</strong> {selectedUser.nomeGrupo}
            </p>
            <p>
              <strong>Líder do Grupo:</strong> {selectedUser.liderGrupo}
            </p>
            <p>
              <strong>Localidade:</strong> {selectedUser.localidade}
            </p>
            <p>
              <strong>WhatsApp:</strong> {selectedUser.whatsapp}
            </p>
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
