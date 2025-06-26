import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  userId: string;
  name: string;
  secondName: string;
  email: string;
  role: string;
  interests: string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

// Validar que el token JWT esté presente y no expirado
function isTokenValid(token: string): boolean {
  try {
    if (!token || token.trim() === '') {
      console.log('🔒 Token vacío o nulo');
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('🔒 Token JWT malformado');
      return false;
    }

    const payloadBase64 = parts[1];
    if (!payloadBase64) {
      console.log('🔒 Payload del token vacío');
      return false;
    }

    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    if (!payload.exp) {
      console.log('🔒 Token sin fecha de expiración');
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const isValid = payload.exp > now;
    
    if (!isValid) {
      console.log('🔒 Token expirado:', new Date(payload.exp * 1000));
    } else {
      console.log('✅ Token válido, expira:', new Date(payload.exp * 1000));
    }
    
    return isValid;
  } catch (error) {
    console.error('🔒 Error validando token:', error);
    return false;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const isLoggedIn = !!user;

  // Función para limpiar la sesión
  const clearSession = () => {
    console.log('🧹 Limpiando sesión...');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_info');
    setUser(null);
  };

  // Función para restaurar la sesión
  const restoreSession = () => {
    try {
      console.log('🔄 Intentando restaurar sesión...');
      
      const token = sessionStorage.getItem('jwt_token');
      const userInfo = sessionStorage.getItem('user_info');

      console.log('🔍 Token encontrado:', !!token);
      console.log('🔍 UserInfo encontrado:', !!userInfo);

      if (!token || !userInfo) {
        console.log('❌ Datos de sesión incompletos');
        clearSession();
        return false;
      }

      if (!isTokenValid(token)) {
        console.log('❌ Token inválido o expirado');
        clearSession();
        return false;
      }

      const parsedUser = JSON.parse(userInfo);
      
      // Validar que el usuario tenga los campos requeridos
      if (!parsedUser.userId || !parsedUser.email) {
        console.log('❌ Datos de usuario incompletos:', parsedUser);
        clearSession();
        return false;
      }

      console.log('✅ Sesión restaurada exitosamente para:', parsedUser.email);
      setUser(parsedUser);
      return true;
    } catch (error) {
      console.error('❌ Error restaurando sesión:', error);
      clearSession();
      return false;
    }
  };

  // Efecto inicial para restaurar sesión
  useEffect(() => {
    console.log('🚀 Inicializando AuthContext...');
    restoreSession();
    setIsInitialized(true);
  }, []);

  // Efecto para escuchar cambios en sessionStorage (para múltiples pestañas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('📡 Cambio en sessionStorage detectado:', e.key);
      
      if (e.key === 'jwt_token' || e.key === 'user_info') {
        // Si se eliminó algún dato de sesión
        if (!e.newValue) {
          console.log('🔄 Datos de sesión eliminados en otra pestaña');
          setUser(null);
        } else {
          // Si se actualizó, intentar restaurar
          console.log('🔄 Datos de sesión actualizados en otra pestaña');
          restoreSession();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Efecto para verificar token periódicamente (cada 5 minutos)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const token = sessionStorage.getItem('jwt_token');
      if (!token || !isTokenValid(token)) {
        console.log('⏰ Token expirado detectado en verificación periódica');
        clearSession();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user]);

  const login = (userData: User, token: string) => {
    console.log('🔐 Iniciando sesión para:', userData.email);
    
    try {
      sessionStorage.setItem('jwt_token', token);
      sessionStorage.setItem('user_info', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ Sesión iniciada exitosamente');
    } catch (error) {
      console.error('❌ Error guardando datos de sesión:', error);
      throw new Error('Error al guardar la sesión');
    }
  };

  const logout = () => {
    console.log('👋 Cerrando sesión...');
    clearSession();
  };

  // No renderizar hasta que se haya inicializado
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/80 font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};