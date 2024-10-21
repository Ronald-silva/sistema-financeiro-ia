import React, { useState, useEffect } from 'react';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/transactionService';
import { toast } from 'react-toastify';
import useAutoCategorizacao from '../hooks/useAutoCategorizacao';
import useAIFinancialAssistant from '../hooks/useAIFinancialAssistant';
import InvestmentTracker from '../components/InvestmentTracker';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({ description: '', amount: '' });
  const [financialAdvice, setFinancialAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [balance, setBalance] = useState(0);
  const [incomeVsExpense, setIncomeVsExpense] = useState({ income: 0, expense: 0 });
  const [bitcoinHoldings, setBitcoinHoldings] = useState(0);
  const [dollarHoldings, setDollarHoldings] = useState(0);

  const { categorizarTransacao } = useAutoCategorizacao();
  const { analyzeFinances } = useAIFinancialAssistant();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateBalance();
      calculateIncomeVsExpense();
    }
  }, [transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      toast.error('Erro ao carregar transações.');
    }
    setLoading(false);
  };

  const handleAddOrUpdateTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = parseFloat(currentTransaction.amount);
      const type = amount >= 0 ? 'ganho' : 'gasto';
      const category = await categorizarTransacao(currentTransaction.description, amount, type);
      
      const transactionData = {
        ...currentTransaction,
        amount: amount,
        type: type,
        category: category,
        date: new Date().toISOString()
      };

      if (isEditing) {
        await updateTransaction(transactionData);
        toast.success('Transação atualizada com sucesso!');
      } else {
        await addTransaction(transactionData);
        toast.success('Transação adicionada com sucesso!');
      }
      
      setIsEditing(false);
      setCurrentTransaction({ description: '', amount: '' });
      await fetchTransactions();
    } catch (error) {
      toast.error('Erro ao salvar transação.');
    }
    setLoading(false);
  };

  const handleEdit = (transaction) => {
    setIsEditing(true);
    setCurrentTransaction(transaction);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      toast.success('Transação excluída com sucesso!');
      await fetchTransactions();
    } catch (error) {
      toast.error('Erro ao excluir transação.');
    }
  };

  const calculateBalance = () => {
    const total = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    setBalance(total);
  };

  const calculateIncomeVsExpense = () => {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
    setIncomeVsExpense({ income, expense });
  };

  const generateFinancialAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const advice = await analyzeFinances(transactions, balance, incomeVsExpense, bitcoinHoldings, dollarHoldings);
      setFinancialAdvice(advice);
    } catch (error) {
      console.error('Erro ao gerar conselho financeiro:', error);
      toast.error('Não foi possível gerar o conselho financeiro. Por favor, tente novamente.');
    } finally {
      setLoadingAdvice(false);
    }
  };

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center mb-6">Painel Financeiro</h1>

      <form onSubmit={handleAddOrUpdateTransaction} className="mb-8">
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <input
              type="text"
              value={currentTransaction.description}
              onChange={(e) => setCurrentTransaction({ ...currentTransaction, description: e.target.value })}
              placeholder="Descrição da transação"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="w-full md:w-1/2 px-3">
            <input
              type="number"
              value={currentTransaction.amount}
              onChange={(e) => setCurrentTransaction({ ...currentTransaction, amount: e.target.value })}
              placeholder="Valor (positivo para ganho, negativo para gasto)"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          {isEditing ? 'Atualizar' : 'Adicionar'} Transação
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Balanço Atual</h2>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Ganhos vs. Gastos</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Ganhos', value: incomeVsExpense.income },
                  { name: 'Gastos', value: incomeVsExpense.expense }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <InvestmentTracker
        onUpdateBitcoin={setBitcoinHoldings}
        onUpdateDollar={setDollarHoldings}
      />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Conselho Financeiro</h2>
        <button
          onClick={generateFinancialAdvice}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition mb-4"
          disabled={loadingAdvice}
        >
          {loadingAdvice ? 'Gerando Conselho...' : 'Gerar Conselho Financeiro'}
        </button>
        {loadingAdvice ? (
          <p>Analisando suas finanças...</p>
        ) : (
          financialAdvice && <pre className="p-4 bg-green-100 rounded whitespace-pre-wrap">{financialAdvice}</pre>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Lista de Transações</h2>
        {loading ? (
          <p>Carregando transações...</p>
        ) : (
          <ul className="space-y-4">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex justify-between items-center p-4 bg-gray-100 rounded">
                <span>
                  {transaction.description}: R$ {transaction.amount.toFixed(2)} 
                  <span className={`ml-2 ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ({transaction.amount >= 0 ? 'Ganho' : 'Gasto'})
                  </span>
                </span>
                <div>
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="bg-yellow-500 text-white p-2 rounded mr-2 hover:bg-yellow-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                  >
                    Deletar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;