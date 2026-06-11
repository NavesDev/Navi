import { useState } from 'react';
import { formatDate, formatCurrency } from '@navi/shared';
import type { Transaction, Goal, Habit } from '@navi/types';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Olá! Sou o Navi, seu assistente pessoal com IA. Como posso te ajudar hoje? Posso gerenciar suas finanças, metas ou registrar novos hábitos.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      role: 'user' as const,
      content: 'Registrei um gasto de R$ 45,90 com almoço hoje.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      role: 'assistant' as const,
      content: 'Entendido! Adicionei uma despesa de R$ 45,90 na categoria "Alimentação". Seu saldo restante para a semana é R$ 354,10.',
      createdAt: new Date().toISOString(),
    }
  ]);

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate assistant reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `Recebi sua mensagem: "${userMsg.content}". Vou processar isso com a IA assim que o backend estiver totalmente conectado!`,
          createdAt: new Date().toISOString(),
        }
      ]);
    }, 1000);
  };

  const mockTransactions: Transaction[] = [
    { id: '1', amount: 12000, type: 'income', category: 'Freelance', description: 'Web Design', date: '2026-06-10', accountId: 'a1', createdAt: '' },
    { id: '2', amount: 4590, type: 'expense', category: 'Alimentação', description: 'Almoço Executivo', date: '2026-06-10', accountId: 'a1', createdAt: '' },
    { id: '3', amount: 1500, type: 'expense', category: 'Transporte', description: 'Uber', date: '2026-06-09', accountId: 'a1', createdAt: '' },
  ];

  const mockGoals: Goal[] = [
    { id: '1', title: 'Reserva de Emergência', targetValue: 1000000, currentValue: 650000, unit: 'BRL', status: 'pending', createdAt: '' },
    { id: '2', title: 'Ler Livros', targetValue: 12, currentValue: 5, unit: 'livros', status: 'pending', createdAt: '' },
  ];

  const mockHabits: Habit[] = [
    { id: '1', name: 'Exercitar 30 min', frequency: 'daily', streak: 5, bestStreak: 12, createdAt: '' },
    { id: '2', name: 'Meditar', frequency: 'daily', streak: 3, bestStreak: 8, createdAt: '' },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <span className="logo-sparkle">✨</span>
          <h1>Navi</h1>
          <span className="logo-badge">AI Assistant</span>
        </div>
        <div className="header-meta">
          <span>{formatDate(new Date())}</span>
        </div>
      </header>

      <main className="dashboard-grid">
        {/* Left column: Chat */}
        <section className="chat-panel card">
          <div className="card-header">
            <h2>Fale com o Navi</h2>
            <span className="status-indicator online">Online</span>
          </div>
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-bubble ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Digite uma mensagem (ex: 'Adicione despesa de R$ 15 com uber')"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Enviar</button>
          </div>
        </section>

        {/* Right column: Widgets */}
        <div className="widgets-column">
          {/* Finances */}
          <section className="finance-widget card">
            <h2>Fluxo de Caixa</h2>
            <div className="balance-grid">
              <div className="balance-item positive">
                <span className="label">Receitas</span>
                <span className="value">{formatCurrency(120.00)}</span>
              </div>
              <div className="balance-item negative">
                <span className="label">Despesas</span>
                <span className="value">{formatCurrency(60.90)}</span>
              </div>
            </div>
            <div className="transaction-list">
              <h3>Transações Recentes</h3>
              {mockTransactions.map(t => (
                <div key={t.id} className="transaction-row">
                  <div>
                    <div className="tx-description">{t.description}</div>
                    <div className="tx-meta">{t.category} • {formatDate(t.date)}</div>
                  </div>
                  <span className={`tx-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount / 100)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Goals and Habits */}
          <div className="sub-widgets-grid">
            <section className="goals-widget card">
              <h2>Metas Ativas</h2>
              <div className="goals-list">
                {mockGoals.map(g => {
                  const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                  return (
                    <div key={g.id} className="goal-row">
                      <div className="goal-info">
                        <span className="goal-title">{g.title}</span>
                        <span className="goal-progress-text">{pct}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="habits-widget card">
              <h2>Hábitos</h2>
              <div className="habits-list">
                {mockHabits.map(h => (
                  <div key={h.id} className="habit-row">
                    <span className="habit-name">⚡ {h.name}</span>
                    <span className="habit-streak-badge">{h.streak} dias</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
