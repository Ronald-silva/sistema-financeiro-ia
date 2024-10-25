import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const EmergencyFund = ({ transactions, balance }) => {
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [targetMonths, setTargetMonths] = useState(6);
  const [targetAmount, setTargetAmount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [fundHistory, setFundHistory] = useState([]);
  const [timeToTarget, setTimeToTarget] = useState(null);
  const [emergencyTransactions, setEmergencyTransactions] = useState([]);

  // Calcula despesas médias mensais
  useEffect(() => {
    const calculateMonthlyExpenses = () => {
      const expenses = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
      
      const monthlyAverage = expenses / 3; // Média dos últimos 3 meses
      setMonthlyExpenses(monthlyAverage);
      setTargetAmount(monthlyAverage * targetMonths);
    };

    if (transactions.length > 0) {
      calculateMonthlyExpenses();
    }
  }, [transactions, targetMonths]);

  // Calcula progresso
  useEffect(() => {
    if (targetAmount > 0) {
      const currentProgress = (balance / targetAmount) * 100;
      setProgress(Math.min(currentProgress, 100));
    }
  }, [balance, targetAmount]);

  // Categorização e histórico do fundo
  useEffect(() => {
    const categorizeTransactions = () => {
      const emergency = transactions.filter(t => 
        t.description.toLowerCase().includes('emergencial') ||
        t.description.toLowerCase().includes('reserva') ||
        t.category === 'Fundo Emergencial'
      );
      setEmergencyTransactions(emergency);
      
      // Gera histórico do fundo
      const history = generateFundHistory(emergency);
      setFundHistory(history);

      // Verifica se houve saques do fundo
      checkForWithdrawals(emergency);
    };

    categorizeTransactions();
  }, [transactions]);

  // Gera recomendações
  useEffect(() => {
    const generateRecommendations = () => {
      const newRecommendations = [];
      
      if (balance < targetAmount) {
        const recommendedMonthlySaving = (targetAmount - balance) / 12;
        newRecommendations.push({
          title: 'Meta de Economia Mensal',
          description: `Para atingir sua meta em 12 meses, procure economizar R$ ${recommendedMonthlySaving.toFixed(2)} por mês.`
        });
      }

      if (progress < 30) {
        newRecommendations.push({
          title: 'Prioridade Alta',
          description: 'Seu fundo emergencial está abaixo do recomendado. Considere reduzir gastos não essenciais.'
        });
      }

      const avgContribution = calculateAverageMonthlyContribution();
      if (avgContribution < monthlyExpenses * 0.1) {
        newRecommendations.push({
          title: 'Aumente suas Contribuições',
          description: 'Suas contribuições mensais estão abaixo do ideal. Tente aumentar os aportes.'
        });
      }

      setRecommendations(newRecommendations);
    };

    generateRecommendations();
  }, [progress, balance, targetAmount, monthlyExpenses]);

  // Funções auxiliares
  const generateFundHistory = (emergencyTransactions) => {
    const history = [];
    let runningBalance = 0;
    
    emergencyTransactions.forEach(transaction => {
      runningBalance += transaction.amount;
      history.push({
        date: new Date(transaction.date).toLocaleDateString(),
        balance: runningBalance,
        type: transaction.amount >= 0 ? 'Aporte' : 'Saque'
      });
    });

    return history;
  };

  const checkForWithdrawals = (transactions) => {
    const recentWithdrawals = transactions
      .filter(t => t.amount < 0)
      .slice(-3);

    recentWithdrawals.forEach(withdrawal => {
      toast.warning(`Alerta: Saque do fundo emergencial de R$${Math.abs(withdrawal.amount).toFixed(2)} realizado em ${new Date(withdrawal.date).toLocaleDateString()}`);
    });
  };

  const calculateAverageMonthlyContribution = () => {
    if (emergencyTransactions.length === 0) return 0;
    
    const contributions = emergencyTransactions
      .filter(t => t.amount > 0)
      .map(t => t.amount);

    return contributions.length > 0
      ? contributions.reduce((a, b) => a + b, 0) / contributions.length
      : 0;
  };

  const calculateTimeToTarget = () => {
    if (balance >= targetAmount) return '0';
    
    const avgMonthlyContribution = calculateAverageMonthlyContribution();
    if (avgMonthlyContribution <= 0) return 'Indefinido';

    const monthsToTarget = (targetAmount - balance) / avgMonthlyContribution;
    return monthsToTarget.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Fundo Emergencial</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Meses de Cobertura Desejados
            </label>
            <select
              value={targetMonths}
              onChange={(e) => setTargetMonths(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <h3 className="text-lg font-medium mb-2">Métricas Principais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Despesa Mensal Média</p>
                <p className="text-lg font-semibold">R$ {monthlyExpenses.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Meta Total</p>
                <p className="text-lg font-semibold">R$ {targetAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Saldo Atual</p>
                <p className="text-lg font-semibold">R$ {balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progresso</p>
                <p className="text-lg font-semibold">{progress.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Progresso</h3>
          <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                progress < 30 ? 'bg-red-500' :
                progress < 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {progress < 100 
              ? `Faltam R$ ${(targetAmount - balance).toFixed(2)} para atingir a meta`
              : 'Meta atingida! Continue mantendo seu fundo emergencial.'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Histórico do Fundo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={fundHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="balance" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Análise Temporal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Tempo Estimado para Meta</h4>
            <p className="text-blue-700">{calculateTimeToTarget()} meses</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Contribuição Média Mensal</h4>
            <p className="text-blue-700">
              R$ {calculateAverageMonthlyContribution().toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Recomendações</h3>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">{rec.title}</h4>
              <p className="text-blue-700">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Últimas Transações do Fundo</h3>
        <div className="space-y-2">
          {emergencyTransactions.slice(-5).reverse().map((transaction, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${
                transaction.amount >= 0 
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{transaction.description}</span>
                <span className="font-medium">
                  R$ {Math.abs(transaction.amount).toFixed(2)}
                  {transaction.amount >= 0 ? ' (Aporte)' : ' (Saque)'}
                </span>
              </div>
              <div className="text-sm opacity-75">
                {new Date(transaction.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Dicas para Aumentar seu Fundo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Reduza Gastos</h4>
            <ul className="list-disc list-inside text-green-700 text-sm">
              <li>Revise assinaturas e serviços recorrentes</li>
              <li>Compare preços antes de comprar</li>
              <li>Estabeleça um orçamento mensal</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Aumente sua Renda</h4>
            <ul className="list-disc list-inside text-green-700 text-sm">
              <li>Considere trabalhos freelance</li>
              <li>Venda itens não utilizados</li>
              <li>Busque capacitação profissional</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyFund;