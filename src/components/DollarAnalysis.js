import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const DollarAnalysis = () => {
  const [dollarPrice, setDollarPrice] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [platforms, setPlatforms] = useState([
    { name: 'Binance', price: null, spread: 0.15, rating: 4.8 },
    { name: 'Remessa Online', price: null, spread: 0.20, rating: 4.5 },
    { name: 'Wise', price: null, spread: 0.25, rating: 4.7 },
    { name: 'Banco Central', price: null, spread: 0.30, rating: 4.0 }
  ]);
  const [bestTimeToday, setBestTimeToday] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDollarData();
    const interval = setInterval(fetchDollarData, 300000); // Atualiza a cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const fetchDollarData = async () => {
    try {
      // Fetch current dollar price
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      const currentPrice = response.data.rates.BRL;
      setDollarPrice(currentPrice);

      // Simular preços para cada plataforma
      const updatedPlatforms = platforms.map(platform => ({
        ...platform,
        price: (currentPrice * (1 + platform.spread)).toFixed(4)
      }));
      setPlatforms(updatedPlatforms);

      // Gerar dados históricos simulados
      generateHistoricalData(currentPrice);
      
      analyzeBestTime();
      generateRecommendation(currentPrice);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados do dólar:', error);
      setLoading(false);
    }
  };

  const generateHistoricalData = (currentPrice) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const randomVariation = (Math.random() - 0.5) * 0.2;
      return {
        date: date.toLocaleDateString(),
        price: (currentPrice + randomVariation).toFixed(4)
      };
    });
    setHistoricalData(last30Days);
  };

  const analyzeBestTime = () => {
    // Análise simplificada dos melhores horários
    const hour = new Date().getHours();
    if (hour >= 10 && hour <= 12) {
      setBestTimeToday('Entre 10h e 12h - Mercado mais estável');
    } else if (hour >= 14 && hour <= 16) {
      setBestTimeToday('Entre 14h e 16h - Maior liquidez');
    } else {
      setBestTimeToday('Fora do horário ideal de negociação');
    }
  };

  const generateRecommendation = (currentPrice) => {
    const averagePrice = historicalData.reduce((acc, cur) => acc + parseFloat(cur.price), 0) / historicalData.length;
    const priceVariation = ((currentPrice - averagePrice) / averagePrice) * 100;

    let rec = '';
    if (priceVariation < -2) {
      rec = 'Momento favorável para compra. Preço abaixo da média mensal.';
    } else if (priceVariation > 2) {
      rec = 'Considere aguardar. Preço acima da média mensal.';
    } else {
      rec = 'Preço próximo à média. Decisão depende da sua necessidade imediata.';
    }
    setRecommendation(rec);
  };

  const getBestPlatform = () => {
    return platforms.reduce((best, current) => 
      parseFloat(current.price) < parseFloat(best.price) ? current : best
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Carregando análise do dólar...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Análise do Dólar</h2>
      
      {/* Preço Atual e Recomendação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Cotação Atual</h3>
          <p className="text-3xl font-bold text-blue-600">R$ {dollarPrice?.toFixed(4)}</p>
          <p className="text-sm text-blue-700 mt-2">{bestTimeToday}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-2">Recomendação</h3>
          <p className="text-green-700">{recommendation}</p>
        </div>
      </div>

      {/* Gráfico Histórico */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Histórico de Preços (30 dias)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#3B82F6" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparativo de Plataformas */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Comparativo de Plataformas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <div 
              key={platform.name} 
              className={`p-4 rounded-lg ${
                platform.name === getBestPlatform().name 
                  ? 'bg-green-50 border-2 border-green-500' 
                  : 'bg-gray-50'
              }`}
            >
              <h4 className="font-medium">{platform.name}</h4>
              <p className="text-lg font-semibold">R$ {platform.price}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">Rating: {platform.rating}</span>
                <span className="text-sm text-gray-600 ml-2">
                  Spread: {(platform.spread * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dicas e Considerações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Melhores Práticas</h3>
          <ul className="text-sm space-y-2">
            <li>• Compare taxas e spreads entre plataformas</li>
            <li>• Evite horários de alta volatilidade</li>
            <li>• Considere fazer compras programadas</li>
            <li>• Monitore eventos econômicos importantes</li>
          </ul>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Fatores de Impacto</h3>
          <ul className="text-sm space-y-2">
            <li>• Decisões do Federal Reserve (FED)</li>
            <li>• Indicadores econômicos do Brasil e EUA</li>
            <li>• Eventos geopolíticos</li>
            <li>• Fluxo de capital estrangeiro</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DollarAnalysis;