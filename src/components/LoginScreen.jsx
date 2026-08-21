import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, LogIn, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      setIsLoading(false);

      if (!result.success) {
        setError('Usuário ou senha incorretos.');
        return;
      }

      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card">
        <div className="login-header">
          <div
            style={{
              display: 'inline-flex',
              padding: '1rem',
              background: 'rgba(82, 183, 136, 0.15)',
              borderRadius: '50%',
              marginBottom: '1rem',
              color: 'var(--color-primary)',
            }}
          >
            <Sprout size={40} className="brand-icon" />
          </div>
          <h1>Nas Ramas da Esperança</h1>
          <p>Portal de Controle e Gestão</p>
        </div>

        {/* Perfis disponíveis */}
        <div className="login-profiles-hint">
          <div className="login-profile-badge professor-badge">
            <GraduationCap size={14} />
            Professor
          </div>
          <div className="login-profile-badge bolsista-badge">
            <BookOpen size={14} />
            Bolsista
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Login</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', gap: '0.75rem', padding: '0.9rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Entrando...</span>
            ) : (
              <>
                <LogIn size={20} />
                Entrar no Sistema
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
