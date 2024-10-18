import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase-config';  // Certifique-se de que o firebase-config.js está configurado corretamente

// Função para adicionar uma transação (ganho ou gasto)
export const addTransaction = async (description, amount) => {
  try {
    await addDoc(collection(db, 'transactions'), {
      description,
      amount,
      date: new Date(),  // Inclui a data da transação
    });
    console.log("Transação adicionada com sucesso!");
  } catch (e) {
    console.error("Erro ao adicionar transação: ", e);
  }
};

// Função para listar todas as transações
export const getTransactions = async () => {
  try {
    const transactionsCollection = collection(db, 'transactions');
    const transactionsSnapshot = await getDocs(transactionsCollection);
    const transactionsList = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),  // Inclui os dados da transação
    }));
    return transactionsList;
  } catch (e) {
    console.error("Erro ao buscar transações: ", e);
    return [];
  }
};

// Função para atualizar uma transação existente
export const updateTransaction = async (id, updatedData) => {
  try {
    const transactionRef = doc(db, 'transactions', id);
    await updateDoc(transactionRef, updatedData);
    console.log("Transação atualizada com sucesso!");
  } catch (e) {
    console.error("Erro ao atualizar transação: ", e);
  }
};

// Função para deletar uma transação
export const deleteTransaction = async (id) => {
  try {
    const transactionRef = doc(db, 'transactions', id);
    await deleteDoc(transactionRef);
    console.log("Transação deletada com sucesso!");
  } catch (e) {
    console.error("Erro ao deletar transação: ", e);
  }
};
