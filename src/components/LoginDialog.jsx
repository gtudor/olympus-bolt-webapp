import { useState } from 'react';

function LoginDialog({ onLoginSuccess, onTwoFactorRequired }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch("https://gcp.olympus.io/api/v1/entrance/login", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apiKey: "3y6gp1hz9de7cgvkn7xqjb3285p8udf1",
          email,
          password
        })
      });

      const data = await response.json();

      if (data.accessToken) {
        onLoginSuccess(data.accessToken);
      } else if (data.rememberToken) {
        onTwoFactorRequired(data.rememberToken);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
          {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default LoginDialog;
