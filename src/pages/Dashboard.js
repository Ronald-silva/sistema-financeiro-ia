import React, { useEffect, useState } from 'react';
import { getTransactions, updateTransaction, deleteTransaction } from '../services/transactionService';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Parser } from 'json2csv';
import { saveAs } from 'file-saver';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Carrega as transações ao montar o componente
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
      setFilteredTransactions(data);  // Inicialmente, exibe todas as transações
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  // Atualiza as transações filtradas com base no termo de busca
  useEffect(() => {
    const results = transactions.filter((transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm)
    );
    setFilteredTransactions(results);
  }, [searchTerm, transactions]);

  // Função para editar a transação
  const handleEdit = (transaction) => {
    setIsEditing(true);
    setCurrentTransaction(transaction);
  };

  // Função para atualizar a transação
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateTransaction(currentTransaction.id, {
        description: currentTransaction.description,
        amount: currentTransaction.amount,
      });
      toast.success('Transação atualizada com sucesso!');
      const updatedTransactions = await getTransactions();
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      setIsEditing(false);
      setCurrentTransaction(null);
    } catch (error) {
      toast.error('Erro ao atualizar transação.');
    }
  };

  // Função para deletar a transação
  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      toast.success('Transação excluída com sucesso!');
      const updatedTransactions = await getTransactions();
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
    } catch (error) {
      toast.error('Erro ao excluir transação.');
    }
  };

  // Função para exportar dados para CSV
  const exportToCSV = () => {
    const fields = ['description', 'amount'];  // Campos a serem exportados
    const parser = new Parser({ fields });
    const csv = parser.parse(transactions);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'transacoes.csv');
  };

  // Prepara os dados para o gráfico
  const data = transactions.map((transaction) => ({
    name: transaction.description,
    value: transaction.amount,
  }));

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center mb-6">Painel de Controle</h1>

      {/* Barra de Pesquisa */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          placeholder="Pesquisar transações por descrição ou valor"
        />
      </div>

      {/* Gráfico de Evolução Financeira */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-4">Evolução Financeira</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Botão para Exportar CSV */}
      <div className="mb-6">
        <button onClick={exportToCSV} className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition">
          Exportar CSV
        </button>
      </div>

      {loading ? (
        <div className="spinner mx-auto"></div>
      ) : (
        <>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="mb-4">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <input
                  type="text"
                  value={currentTransaction.description}
                  onChange={(e) =>
                    setCurrentTransaction({ ...currentTransaction, description: e.target.value })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg mb-2 md:mb-0"
                  placeholder="Descrição"
                  required
                />
                <input
                  type="number"
                  value={currentTransaction.amount}
                  onChange={(e) =>
                    setCurrentTransaction({ ...currentTransaction, amount: e.target.value })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="Valor"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-2 mt-4 rounded-lg hover:bg-green-700 transition"
              >
                Atualizar
              </button>
            </form>
          ) : (
            <ul className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <p className="text-center text-gray-500">Nenhuma transação encontrada.</p>
              ) : (
                filteredTransactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex flex-col md:flex-row justify-between items-center p-4 mb-2 bg-gray-100 rounded-lg shadow-sm"
                  >
                    <span>{transaction.description}: R$ {transaction.amount}</span>
                    <div className="flex space-x-2 mt-2 md:mt-0">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="bg-yellow-400 text-white p-2 rounded-lg hover:bg-yellow-500 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Deletar
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
