'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, get, child } from 'firebase/database';
import { db, realtimeDb } from '../firebase';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  id: string;
  apelido: string;
  igreja: string;
  liderGrupo: string;
  localidade: string;
  nomeCompleto: string;
  nomeGrupo: string;
  whatsapp: string;
}

export default function Relatorio() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalIgrejas, setTotalIgrejas] = useState<number>(0);
  const [peoplePerIgreja, setPeoplePerIgreja] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar do Firestore
        const usersRef = collection(db, 'inscricoesGincana');
        const snapshot = await getDocs(usersRef);
        const firestoreData: User[] = snapshot.docs.map((doc) => {
          const { id, ...userData } = doc.data() as User;
          return {
            id: doc.id,
            ...userData,
          };
        });

        // Buscar do Realtime Database
        const dbRef = ref(realtimeDb);
        const snapshotRT = await get(child(dbRef, 'inscricoesGincana'));
        let realtimeData: User[] = [];
        if (snapshotRT.exists()) {
          const data = snapshotRT.val();
          realtimeData = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
        }

        // Combinar os dados de ambas as fontes
        const allData: User[] = [...firestoreData, ...realtimeData];

        // Processar os dados
        const total = allData.length;
        setTotalUsers(total);

        const allIgrejas = allData.map((user) => user.igreja || 'Igreja Não Informada');
        const uniqueIgrejas = new Set(allIgrejas);
        setTotalIgrejas(uniqueIgrejas.size);

        const countPerIgreja: Record<string, number> = {};
        allData.forEach((user) => {
          const igreja = user.igreja || 'Igreja Não Informada';
          if (countPerIgreja[igreja]) {
            countPerIgreja[igreja]++;
          } else {
            countPerIgreja[igreja] = 1;
          }
        });
        setPeoplePerIgreja(countPerIgreja);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Preparar os dados do gráfico
  const chartData = {
    labels: Object.keys(peoplePerIgreja),
    datasets: [
      {
        label: 'Número de Pessoas por Igreja',
        data: Object.values(peoplePerIgreja),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Número de Pessoas por Igreja',
      },
    },
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Relatório de Inscrições</h1>

      {/* Relatório Resumido */}
      <div className="mb-6">
        <p className="text-lg">
          <strong>Total de Pessoas Inscritas:</strong> {totalUsers}
        </p>
        <p className="text-lg">
          <strong>Total de Igrejas Representadas:</strong> {totalIgrejas}
        </p>
      </div>

      {/* Gráfico */}
      <div className="mt-6">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}
