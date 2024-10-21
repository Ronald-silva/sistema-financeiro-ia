import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InvestmentTracker({ onUpdateBitcoin, onUpdateDollar }) {
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [dollarPrice, setDollarPrice] = useState(null);
  const [bitcoinHoldings, setBitcoinHoldings] = useState(0);
  const [dollarHoldings, setDollarHoldings] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrices = async () => {
    setError(null);
    try {
      console.log('Iniciando busca de preços...');
      
      const bitcoinResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl');
      console.log('Resposta Bitcoin:', bitcoinResponse.data);
      
      const dollarResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      console.log('Resposta Dólar:', dollarResponse.data);

      if (bitcoinResponse.data && bitcoinResponse.data.bitcoin && bitcoinResponse.data.bitcoin.brl) {
        setBitcoinPrice(bitcoinResponse.data.bitcoin.brl);
      } else {
        throw new Error('Dados do Bitcoin inválidos');
      }

      if (dollarResponse.data && dollarResponse.data.rates && dollarResponse.data.rates.BRL) {
        setDollarPrice(dollarResponse.data.rates.BRL);
      } else {
        throw new Error('Dados do Dólar inválidos');
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
      setError('Falha ao atualizar preços. Por favor, tente novamente mais tarde.');
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const updateHoldings = (type, amount) => {
    if (type === 'bitcoin') {
      setBitcoinHoldings(parseFloat(amount) || 0);
      onUpdateBitcoin(parseFloat(amount) || 0);
    } else if (type === 'dollar') {
      setDollarHoldings(parseFloat(amount) || 0);
      onUpdateDollar(parseFloat(amount) || 0);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">Rastreador de Investimentos</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <h3 className="text-xl font-semibold">Bitcoin</h3>
        <p>Preço atual: R$ {bitcoinPrice ? bitcoinPrice.toFixed(2) : 'Carregando...'}</p>
        <input
          type="number"
          placeholder="Quantidade de Bitcoin"
          value={bitcoinHoldings}
          onChange={(e) => updateHoldings('bitcoin', e.target.value)}
          className="mt-2 p-2 border rounded"
        />
        <p className="mt-2">Valor total: R$ {bitcoinPrice ? (bitcoinPrice * bitcoinHoldings).toFixed(2) : 'Calculando...'}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold">Dólar</h3>
        <p>Cotação atual: R$ {dollarPrice ? dollarPrice.toFixed(2) : 'Carregando...'}</p>
        <input
          type="number"
          placeholder="Quantidade de Dólares"
          value={dollarHoldings}
          onChange={(e) => updateHoldings('dollar', e.target.value)}
          className="mt-2 p-2 border rounded"
        />
        <p className="mt-2">Valor total: R$ {dollarPrice ? (dollarPrice * dollarHoldings).toFixed(2) : 'Calculando...'}</p>
      </div>

      <p className="text-sm text-gray-600">
        Última atualização: {lastUpdated ? lastUpdated.toLocaleString() : 'Ainda não atualizado'}
      </p>
      <button
        onClick={fetchPrices}
        className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
      >
        Atualizar Preços
      </button>
    </div>
  );
}

export default InvestmentTracker;