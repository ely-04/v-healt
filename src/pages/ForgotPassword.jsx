import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: false });

    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStatus({ loading: false, message: 'Si existe la cuenta, recibirás un correo con instrucciones.', error: false });
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({ loading: false, message: data.msg || 'Ocurrió un error. Intenta nuevamente.', error: true });
      }
    } catch (err) {
      setStatus({ loading: false, message: 'Error de conexión.', error: true });
    }
  }

  return (
    <div className="page-placeholder max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Recuperar contraseña</h2>

      <p className="text-sm text-gray-600 mb-4">
        Ingresa tu dirección de correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@ejemplo.com"
            className="mt-1 w-full px-3 py-2 border rounded"
            autoComplete="email"
          />
        </label>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full py-2 px-4 bg-green-700 text-white rounded disabled:opacity-60"
        >
          {status.loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>

        {status.message && (
          <p className={`text-sm mt-2 ${status.error ? 'text-red-600' : 'text-green-600'}`}>
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}