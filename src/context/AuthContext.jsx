import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:3000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Función específica para login directo (facial o manual)
  const loginDirect = async (userData, token) => {
    try {
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Error en login directo:', error);
      return { success: false, message: 'Error estableciendo sesión' };
    }
  };

  const loginWithFace = async (faceData) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/face-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          faceDescriptor: faceData.descriptor,
          landmarks: faceData.landmarks,
          expressions: faceData.expressions
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en login facial:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        return { 
          success: true, 
          user: data.user,
          message: 'Usuario registrado exitosamente'
        };
      } else {
        throw new Error(data.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const registerFace = async (email, password, name, faceData) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name,
          faceDescriptor: faceData.descriptor,
          landmarks: faceData.landmarks
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registrando con face:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    loginDirect,
    register,
    loginWithFace,
    registerFace,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};