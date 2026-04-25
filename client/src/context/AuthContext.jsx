import { createContext, useContext, useReducer, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('neuronotes_token') || null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_FAIL':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: try to load user from stored token
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('neuronotes_token');
      if (!token) {
        dispatch({ type: 'AUTH_FAIL' });
        return;
      }
      try {
        const res = await getMe();
        dispatch({ type: 'AUTH_LOADED', payload: res.data.data });
      } catch {
        localStorage.removeItem('neuronotes_token');
        localStorage.removeItem('neuronotes_user');
        dispatch({ type: 'AUTH_FAIL' });
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, ...user } = res.data.data;
    localStorage.setItem('neuronotes_token', token);
    localStorage.setItem('neuronotes_user', JSON.stringify(user));
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    const { token, ...user } = res.data.data;
    localStorage.setItem('neuronotes_token', token);
    localStorage.setItem('neuronotes_user', JSON.stringify(user));
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('neuronotes_token');
    localStorage.removeItem('neuronotes_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
