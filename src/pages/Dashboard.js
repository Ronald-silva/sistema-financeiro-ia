import React, { useState, useEffect } from 'react';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/transactionService';
import { toast } from 'react-toastify';
import useAutoCategorizacao from '../hooks/useAutoCategorizacao';
import useAIFinancialAssistant from '../hooks/useAIFinancialAssistant';
import EmergencyFund from '../components/EmergencyFund';
import DollarAnalysis from '../components/DollarAnalysis';
import InvestmentTracker from '../components/InvestmentTracker';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ActionButton = ({ type, onClick, children }) => {
  const buttonStyles = {
    edit: "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors mr-2 bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
    delete: "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-red-500 hover:bg-red-600 text-white shadow-sm",
    primary: "w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm",
    success: "bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm"
  };

  return (
    <button onClick={onClick} className={buttonStyles[type]}>
      {children}
    </button>
  );
};

const StatCard = ({ title, value, type }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className={`text-2xl font-bold ${type === 'positive' ? 'text-green-600' : type === 'negative' ? 'text-red-600' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
);

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({ 
    description: '', 
    amount: '', 
    isEmergencyFund: false 
  });
  const [financialAdvice, setFinancialAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [balance, setBalance] = useState(0);
  const [incomeVsExpense, setIncomeVsExpense] = useState({ income: 0, expense: 0 });

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
      let category = await categorizarTransacao(currentTransaction.description, amount, type);
      
      if (currentTransaction.isEmergencyFund) {
        category = 'Fundo Emergencial';
      }

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
      setCurrentTransaction({ description: '', amount: '', isEmergencyFund: false });
      await fetchTransactions();
    } catch (error) {
      toast.error('Erro ao salvar transação.');
    }
    setLoading(false);
  };

  const handleEdit = (transaction) => {
    setIsEditing(true);
    setCurrentTransaction({
      ...transaction,
      isEmergencyFund: transaction.category === 'Fundo Emergencial'
    });
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
      const advice = await analyzeFinances(transactions, balance, incomeVsExpense);
      setFinancialAdvice(advice);
    } catch (error) {
      toast.error('Erro ao gerar conselho financeiro.');
    }
    setLoadingAdvice(false);
  };

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Financeiro</h1>

        {/* Formulário de Transação */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleAddOrUpdateTransaction}>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentTransaction.isEmergencyFund}
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    isEmergencyFund: e.target.checked
                  })}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Transação do Fundo Emergencial</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={currentTransaction.description}
                onChange={(e) => setCurrentTransaction({
                  ...currentTransaction,
                  description: e.target.value
                })}
                placeholder="Descrição da transação"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="number"
                value={currentTransaction.amount}
                onChange={(e) => setCurrentTransaction({
                  ...currentTransaction,
                  amount: e.target.value
                })}
                placeholder="Valor (positivo para ganho, negativo para gasto)"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <ActionButton type="primary">
              {isEditing ? 'Atualizar' : 'Adicionar'} Transação
            </ActionButton>
          </form>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Balanço Atual"
            value={`R$ ${balance.toFixed(2)}`}
            type={balance >= 0 ? 'positive' : 'negative'}
          />
          <StatCard
            title="Total de Ganhos"
            value={`R$ ${incomeVsExpense.income.toFixed(2)}`}
            type="positive"
          />
          <StatCard
            title="Total de Gastos"
            value={`R$ ${incomeVsExpense.expense.toFixed(2)}`}
            type="negative"
          />
        </div>

        {/* Fundo Emergencial */}
        <div className="mb-8">
          <EmergencyFund 
            transactions={transactions}
            balance={balance}
          />
        </div>

        {/* Análise do Dólar */}
        <div className="mb-8">
          <DollarAnalysis />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Ganhos vs. Gastos</h2>
            <ResponsiveContainer width="100%" height={300}>
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
          
          <InvestmentTracker />
        </div>

        {/* Lista de Transações */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Transações</h2>
          {loading ? (
            <p>Carregando transações...</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{transaction.description}</span>
                    <span className={`ml-2 ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                      transaction.amount >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.amount >= 0 ? 'Ganho' : 'Gasto'}
                    </span>
                    {transaction.category === 'Fundo Emergencial' && (
                      <span className="ml-2 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                        Fundo Emergencial
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <ActionButton type="edit" onClick={() => handleEdit(transaction)}>
                      Editar
                    </ActionButton>
                    <ActionButton type="delete" onClick={() => handleDelete(transaction.id)}>
                      Deletar
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;