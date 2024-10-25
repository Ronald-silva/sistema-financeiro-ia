const ActionButton = ({ type, onClick, children }) => {
    const buttonStyles = {
      edit: "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors mr-2 bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
      delete: "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-red-500 hover:bg-red-600 text-white shadow-sm"
    };
  
    return (
      <button
        onClick={onClick}
        className={buttonStyles[type]}
      >
        {type === 'edit' && (
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )}
        {type === 'delete' && (
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
        {children}
      </button>
    );
  };
  
  // Agora, vamos atualizar o componente da lista de transações
  const TransactionList = ({ transactions, onEdit, onDelete }) => {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 font-medium">
                    {transaction.description}
                  </span>
                  <span className={`text-${transaction.amount >= 0 ? 'green' : 'red'}-600 font-semibold`}>
                    R$ {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    transaction.amount >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.amount >= 0 ? 'Ganho' : 'Gasto'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ActionButton type="edit" onClick={() => onEdit(transaction)}>
                  Editar
                </ActionButton>
                <ActionButton type="delete" onClick={() => onDelete(transaction.id)}>
                  Deletar
                </ActionButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default TransactionList;