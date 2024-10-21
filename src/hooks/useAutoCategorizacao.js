import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import { callChatGPTAPI } from '../services/chatGPTService';

const useAutoCategorizacao = () => {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const carregarCategorias = async () => {
      const categoriasRef = collection(db, 'categorias');
      const querySnapshot = await getDocs(categoriasRef);
      const categoriasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategorias(categoriasData);
    };
    carregarCategorias();
  }, []);

  const categorizarTransacao = async (descricao, valor, tipo) => {
    // Primeiro, tenta categorizar baseado nas categorias existentes
    for (const categoria of categorias) {
      if (categoria.palavrasChave && categoria.palavrasChave.some(palavra => descricao.toLowerCase().includes(palavra.toLowerCase()))) {
        return categoria.nome;
      }
    }

    // Se não encontrar uma categoria, usa a IA para sugerir uma
    const prompt = `Categorize a seguinte transação financeira: 
    Descrição: "${descricao}", 
    Valor: R$${Math.abs(valor)}, 
    Tipo: ${tipo} (${valor >= 0 ? 'ganho' : 'gasto'}). 
    Responda apenas com o nome da categoria mais apropriada.`;

    const sugestao = await callChatGPTAPI(prompt);
    return sugestao.trim();
  };

  return { categorizarTransacao };
};

export default useAutoCategorizacao;