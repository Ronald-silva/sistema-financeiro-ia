import { useState } from 'react';

const useAIFinancialAssistant = () => {
  const [advice, setAdvice] = useState('');

  const analyzeFinances = async (transactions, balance, incomeVsExpense) => {
    try {
      const financialData = {
        balance: balance.toFixed(2),
        income: incomeVsExpense.income.toFixed(2),
        expense: incomeVsExpense.expense.toFixed(2),
        recentTransactions: transactions.slice(-5).map(t => ({
          description: t.description,
          amount: t.amount.toFixed(2),
          type: t.amount >= 0 ? 'ganho' : 'gasto'
        }))
      };

      // Simulação de chamada à API do Claude
      const response = await simulateClaudeAPI(financialData);
      setAdvice(response);
      return response;
    } catch (error) {
      console.error('Erro ao analisar finanças:', error);
      setAdvice('Desculpe, ocorreu um erro ao gerar o conselho financeiro. Por favor, tente novamente mais tarde.');
      throw error;
    }
  };

  // Função que simula a chamada à API do Claude
  const simulateClaudeAPI = async (data) => {
    // Aqui você implementaria a lógica real de chamada à API
    // Por enquanto, vamos simular uma resposta
    console.log('Dados enviados para Claude:', data);

    // Simula um pequeno atraso para parecer uma chamada de API real
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Gera uma resposta baseada nos dados
    const response = `
    Análise Financeira:
    
    1. Situação Atual:
       - Saldo atual: R$${data.balance}
       - Renda total: R$${data.income}
       - Despesas totais: R$${data.expense}

    2. Análise das Transações Recentes:
       ${data.recentTransactions.map(t => `- ${t.description}: R$${t.amount} (${t.type})`).join('\n       ')}

    3. Recomendações:
       ${generateRecommendations(data)}

    4. Próximos Passos:
       - Estabeleça metas financeiras claras para os próximos 3, 6 e 12 meses.
       - Revise seu orçamento mensalmente e ajuste conforme necessário.
       - Considere criar um fundo de emergência, se ainda não tiver um.

    Continue monitorando suas finanças de perto e não hesite em buscar conselhos adicionais conforme sua situação evolui.
    `;

    return response;
  };

  // Função auxiliar para gerar recomendações baseadas nos dados
  const generateRecommendations = (data) => {
    const recommendations = [];
    const balance = parseFloat(data.balance);
    const income = parseFloat(data.income);
    const expense = parseFloat(data.expense);

    if (expense > income) {
      recommendations.push("Priorize a redução de despesas. Identifique áreas onde você pode cortar gastos não essenciais.");
    }

    if (balance < income * 0.1) {
      recommendations.push("Tente aumentar suas economias. Mire economizar pelo menos 10% de sua renda mensal.");
    }

    if (data.recentTransactions.some(t => t.type === 'gasto' && parseFloat(t.amount) > income * 0.2)) {
      recommendations.push("Observe gastos grandes recentes. Considere se são necessários e como podem impactar seu orçamento a longo prazo.");
    }

    if (recommendations.length === 0) {
      recommendations.push("Continue com sua estratégia atual. Sua gestão financeira parece estar no caminho certo.");
    }

    return recommendations.join('\n       - ');
  };

  return { advice, analyzeFinances };
};

export default useAIFinancialAssistant;