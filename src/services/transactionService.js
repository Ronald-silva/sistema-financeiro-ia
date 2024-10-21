import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase-config';

const transactionsCollection = collection(db, 'transactions');

export const getTransactions = async () => {
  const snapshot = await getDocs(transactionsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    amount: parseFloat(doc.data().amount) // Ensure amount is a number
  }));
};

export const addTransaction = async (transactionData) => {
  await addDoc(transactionsCollection, {
    ...transactionData,
    date: new Date().toISOString()
  });
};

export const updateTransaction = async (transactionData) => {
  const transactionDoc = doc(db, 'transactions', transactionData.id);
  await updateDoc(transactionDoc, transactionData);
};

export const deleteTransaction = async (id) => {
  const transactionDoc = doc(db, 'transactions', id);
  await deleteDoc(transactionDoc);
};