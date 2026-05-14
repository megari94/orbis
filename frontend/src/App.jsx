import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/Chat/ChatHeader';
import StatusStrip from './components/Chat/StatusStrip';
import TagStrip from './components/Chat/TagStrip';
import MessageList from './components/Chat/MessageList';
import ComposeBox from './components/Chat/ComposeBox';
import InfoPanel from './components/InfoPanel/InfoPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import useStore from './store/useStore';
import './App.css';

function LoadingScreen() {
  return (
    <div style={{ height: '100vh', background: 'var(--bg0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 36, height: 36, background: 'var(--red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fa-solid fa-globe" style={{ color: '#fff', fontSize: 16 }} />
      </div>
      <span style={{ color: 'var(--muted)', fontSize: 14 }}>Cargando ORBIS…</span>
    </div>
  );
}

function MainApp() {
  const { conversations, activeConversation, selectConversation, fetchConversations } = useStore();

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      selectConversation(conversations[0]);
    }
  }, [conversations]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopNav />
      <div className="main">
        <Sidebar />
        <section className="chat-area">
          {activeConversation ? (
            <>
              <ChatHeader />
              <StatusStrip />
              <TagStrip />
              <MessageList />
              <ComposeBox />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)', fontSize: 14 }}>
              Seleccioná una conversación para empezar
            </div>
          )}
        </section>
        {activeConversation && <InfoPanel />}
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState('login');

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return view === 'login'
      ? <Login    onGoRegister={() => setView('register')} />
      : <Register onGoLogin={()    => setView('login')} />;
  }

  return <MainApp />;
}
