import React, { useState } from 'react';
import { db } from '../firebase-config';  // Certifique-se de que o arquivo firebase-config está correto
import { collection, addDoc } from 'firebase/firestore';

function AddTransaction() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'transactions'), {
        description,
        amount: parseFloat(amount),
        date: new Date()
      });
      setDescription('');
      setAmount('');
      alert('Transação adicionada com sucesso!');
    } catch (e) {
      console.error('Erro ao adicionar transação: ', e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Valor"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="submit">Adicionar Transação</button>
    </form>
  );
}

export default AddTransaction;
