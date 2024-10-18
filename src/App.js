import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';

function App() {
  return (
    <div className="App">
      {/* Configuração do Toastify para Notificações */}
      <ToastContainer
        position="top-right"
        autoClose={3000}  // Fecha a notificação automaticamente após 3 segundos
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Cabeçalho ou Barra de Navegação */}
      <header className="bg-indigo-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Controle de Gastos AI</h1>
      </header>
      
      {/* Conteúdo principal */}
      <main className="p-6">
        {/* Componente para adicionar novas transações */}
        <AddTransaction />
        
        {/* Componente de visualização e gerenciamento das transações */}
        <Dashboard />
      </main>
      
      {/* Rodapé */}
      <footer className="bg-gray-100 text-center py-4 mt-8">
        <p className="text-sm text-gray-500">© 2024 Controle de Gastos AI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
