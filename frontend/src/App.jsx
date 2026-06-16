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
import ContactsList from './components/Contacts/ContactsList';
import ContactModal from './components/Contact/ContactModal';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
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
  const { conversations, activeConversation, selectConversation, fetchConversations, refreshConversations, refreshMessages } = useStore();
  const [activeTab,      setActiveTab]      = useState('Bandeja');
  const [contactData,    setContactData]    = useState(null); // null = cerrado
  const [msgSearch,      setMsgSearch]      = useState('');

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    const convTimer = setInterval(() => refreshConversations(), 5000);
    const msgTimer  = setInterval(() => refreshMessages(),      4000);
    return () => { clearInterval(convTimer); clearInterval(msgTimer); };
  }, []);

  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      selectConversation(conversations[0]);
    }
  }, [conversations]);

  const openContact = (data) => setContactData(data || {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="main">
        {activeTab === 'Bandeja' ? (
          <>
            <Sidebar />
            <section className="chat-area">
              {activeConversation ? (
                <>
                  <ChatHeader onEditContact={openContact} onSearch={setMsgSearch} />
                  <StatusStrip />
                  <TagStrip />
                  <MessageList searchQuery={msgSearch} />
                  <ComposeBox />
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)', fontSize: 14 }}>
                  Seleccioná una conversación para empezar
                </div>
              )}
            </section>
            {activeConversation && <InfoPanel />}
          </>
        ) : (
          /* Vista Contactos (#10) */
          <section style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ContactsList />
          </section>
        )}
      </div>

      {contactData && (
        <ContactModal
          contact={contactData}
          onClose={() => setContactData(null)}
          onSaved={() => setContactData(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState('login');

  const resetToken = new URLSearchParams(window.location.search).get('resetToken');

  if (loading) return <LoadingScreen />;

  if (resetToken) {
    return (
      <ResetPassword
        token={resetToken}
        onDone={() => {
          window.history.replaceState({}, '', '/');
          setView('login');
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return view === 'login'
      ? <Login    onGoRegister={() => setView('register')} />
      : <Register onGoLogin={()    => setView('login')} />;
  }

  return <MainApp />;
}
