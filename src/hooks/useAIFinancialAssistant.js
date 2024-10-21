import { useState } from 'react';

const useAIFinancialAssistant = () => {
  const [advice, setAdvice] = useState('');

  const analyzeFinances = async (transactions, balance, incomeVsExpense, bitcoinHoldings, dollarHoldings) => {
    try {
      const financialData = {
        balance: balance.toFixed(2),
        income: incomeVsExpense.income.toFixed(2),
        expense: incomeVsExpense.expense.toFixed(2),
        bitcoinHoldings,
        dollarHoldings,
        recentTransactions: transactions.slice(-5).map(t => ({
          description: t.description,
          amount: t.amount.toFixed(2),
          type: t.amount >= 0 ? 'ganho' : 'gasto'
        }))
      };

      // Simulação da análise financeira (substitui a chamada à API do ChatGPT)
      const response = generateFinancialAdvice(financialData);
      setAdvice(response);
      return response;
    } catch (error) {
      console.error('Erro ao analisar finanças:', error);
      return 'Desculpe, ocorreu um erro ao gerar o conselho financeiro. Por favor, tente novamente mais tarde.';
    }
  };

  const generateFinancialAdvice = (data) => {
    // Lógica para gerar conselhos financeiros baseados nos dados
    let advice = `Análise Financeira:\n\n`;
    advice += `1. Situação Atual:\n`;
    advice += `   - Saldo atual: R$${data.balance}\n`;
    advice += `   - Renda total: R$${data.income}\n`;
    advice += `   - Despesas totais: R$${data.expense}\n`;
    advice += `   - Investimentos em Bitcoin: ${data.bitcoinHoldings} BTC\n`;
    advice += `   - Investimentos em Dólar: $${data.dollarHoldings}\n\n`;

    advice += `2. Análise:\n`;
    if (parseFloat(data.expense) > parseFloat(data.income)) {
      advice += `   - Suas despesas estão superando sua renda. Considere reduzir gastos não essenciais.\n`;
    } else {
      advice += `   - Sua renda está cobrindo suas despesas. Ótimo trabalho!\n`;
    }

    if (data.bitcoinHoldings > 0 || data.dollarHoldings > 0) {
      advice += `   - Você tem investimentos em Bitcoin e/ou Dólar, o que demonstra diversificação.\n`;
    }

    advice += `\n3. Recomendações:\n`;
    advice += `   - Mantenha um orçamento detalhado para rastrear suas despesas.\n`;
    advice += `   - Considere aumentar sua reserva de emergência se ainda não tiver uma.\n`;
    advice += `   - Continue monitorando seus investimentos em Bitcoin e Dólar, mas lembre-se de diversificar.\n`;

    return advice;
  };

  return { advice, analyzeFinances };
};

export default useAIFinancialAssistant;