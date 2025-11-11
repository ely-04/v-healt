import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './Auth.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            setError('Token inválido o no proporcionado');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Contraseña restablecida exitosamente. Redirigiendo...');
                setTimeout(() => {
                    navigate('/auth');
                }, 2000);
            } else {
                setError(data.message || 'Error al restablecer la contraseña');
            }
        } catch (error) {
            console.error('Error en reset-password:', error);
            setError('Error de conexión. Verifica que el servidor esté corriendo en http://localhost:3000');
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">Enlace Inválido</h2>
                    <div className="alert alert-error">
                        El enlace de recuperación es inválido o ha expirado.
                    </div>
                    <div className="auth-links">
                        <Link to="/forgot-password" className="auth-link">
                            Solicitar Nuevo Enlace
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Restablecer Contraseña</h2>
                <p className="auth-subtitle">
                    Ingresa tu nueva contraseña
                </p>

                {message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="password">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/auth" className="auth-link">
                        Volver a Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
