import { useState, useEffect } from 'react';

function App() {
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(2);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Initialize or adjust users when userCount changes
  useEffect(() => {
    // Keep existing user data when possible
    const newUsers = Array(userCount)
      .fill()
      .map((_, index) => {
        if (index < users.length) {
          return users[index];
        }
        return { name: `Usuario ${index + 1}`, amount: 0 };
      });
    setUsers(newUsers);
  }, [userCount, users]);

  // Update user name
  const updateName = (index, name) => {
    const newUsers = [...users];
    newUsers[index].name = name;
    setUsers(newUsers);
  };

  // Update user contribution
  const updateAmount = (index, amount) => {
    const newUsers = [...users];
    newUsers[index].amount = parseFloat(amount) || 0;
    setUsers(newUsers);

    // Calculate total
    const newTotal = newUsers.reduce((sum, user) => sum + user.amount, 0);
    setTotal(newTotal);
  };

  // Calculate the split
  const calculateSplit = () => {
    // If there are no users or no expenses, don't calculate
    if (users.length === 0 || total === 0) {
      setResults([]);
      return;
    }

    // Calculate the average amount each person should pay
    const average = total / users.length;

    // Calculate how much each person owes or is owed
    const balances = users.map((user) => ({
      ...user,
      balance: user.amount - average,
    }));

    // Sort by balance (descending)
    balances.sort((a, b) => b.balance - a.balance);

    // Calculate who pays whom
    const transactions = [];
    const debtors = balances.filter((user) => user.balance < 0);
    const creditors = balances.filter((user) => user.balance > 0);

    // Match debtors with creditors
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      // Calculate the transaction amount (minimum of debt and credit)
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

      if (amount > 0) {
        transactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        });
      }

      // Update balances
      debtor.balance += amount;
      creditor.balance -= amount;

      // Move to next user if balance is settled
      if (Math.abs(debtor.balance) < 0.01) debtorIndex++;
      if (Math.abs(creditor.balance) < 0.01) creditorIndex++;
    }

    setResults(transactions);
    setShowResults(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      <header className="text-center mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">
          Divify
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-2">
          Divide gastos entre amigos de manera simple y justa
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Número de Personas:
          </label>
          <input
            type="number"
            min="2"
            value={userCount === 2 ? '' : userCount}
            onChange={(e) => {
              const value = e.target.value;
              // Si está vacío, usamos 2 internamente pero no lo mostramos
              setUserCount(
                value === '' ? 2 : Math.max(2, parseInt(value) || 2)
              );
            }}
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-base"
            placeholder="2"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-600 mb-3 sm:mb-4">
            Detalles de Personas
          </h2>
          <div className="space-y-6">
            {users.map((user, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap -mx-2">
                  <div className="px-2 w-full sm:w-1/2 mb-3 sm:mb-0">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nombre:
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => updateName(index, e.target.value)}
                      className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-base"
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="px-2 w-full sm:w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Monto Aportado ($):
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={user.amount > 0 ? user.amount : ''}
                      onChange={(e) => updateAmount(index, e.target.value)}
                      className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-base"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5 sm:mb-6 bg-indigo-50 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-indigo-600 mb-2">
            Total: ${total.toFixed(2)}
          </h2>
          <p className="text-gray-600">
            Cada persona debe pagar: ${(total / users.length).toFixed(2)}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={calculateSplit}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transform transition duration-150 ease-in-out hover:scale-105 text-base"
          >
            Calcular División
          </button>
        </div>
      </div>

      {showResults && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-600 mb-3 sm:mb-4">
            Resultado
          </h2>

          {results.length === 0 ? (
            <p className="text-gray-600">
              No hay pagos pendientes. Todas las personas aportaron el mismo
              monto.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((transaction, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg hover:bg-indigo-50"
                >
                  <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold">
                        {transaction.from.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{transaction.from}</span>
                  </div>

                  <div className="flex flex-col items-center mb-3 sm:mb-0">
                    <span className="text-sm text-gray-500">debe pagar</span>
                    <span className="font-bold text-indigo-600 text-lg">
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{transaction.to}</span>
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">
                        {transaction.to.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowResults(false)}
              className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-5 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Regresar
            </button>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Guardar/Imprimir
            </button>
          </div>
        </div>
      )}

      <footer className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-10 pb-4">
        © {new Date().getFullYear()} Divify - Valentino Isgró
      </footer>
    </div>
  );
}

export default App;
