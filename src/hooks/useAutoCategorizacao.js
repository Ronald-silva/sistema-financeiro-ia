import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';

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

    // Se não encontrar uma categoria, usa uma lógica simples de categorização
    if (tipo === 'ganho') {
      return 'Renda';
    } else if (valor > 1000) {
      return 'Despesa Grande';
    } else if (descricao.toLowerCase().includes('mercado') || descricao.toLowerCase().includes('supermercado')) {
      return 'Alimentação';
    } else if (descricao.toLowerCase().includes('conta') || descricao.toLowerCase().includes('fatura')) {
      return 'Contas';
    } else {
      return 'Outros';
    }
  };

  return { categorizarTransacao };
};

export default useAutoCategorizacao;