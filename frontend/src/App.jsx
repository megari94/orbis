import { useEffect } from 'react';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/Chat/ChatHeader';
import StatusStrip from './components/Chat/StatusStrip';
import TagStrip from './components/Chat/TagStrip';
import MessageList from './components/Chat/MessageList';
import ComposeBox from './components/Chat/ComposeBox';
import InfoPanel from './components/InfoPanel/InfoPanel';
import useStore from './store/useStore';
import './App.css';

export default function App() {
  const { conversations, activeConversation, selectConversation } = useStore();

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
