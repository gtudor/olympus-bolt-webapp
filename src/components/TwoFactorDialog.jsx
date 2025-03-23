import { useState } from 'react';

function TwoFactorDialog({ onVerifySuccess }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch("https://gcp.olympus.io/api/v1/entrance/verify-otp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rememberToken: localStorage.getItem('rememberToken'),
          otp
        })
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        onVerifySuccess(data.accessToken);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
        <p className="mb-6 text-gray-600">Please enter the passcode sent to your email or phone:</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter passcode"
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Verify
          </button>
          {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default TwoFactorDialog;
