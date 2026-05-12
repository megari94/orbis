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

export default function App() {
  const { fetchConversations, activeConversation } = useStore();

  useEffect(() => { fetchConversations(); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#111111', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#111111' }}>
          {activeConversation ? (
            <>
              <ChatHeader />
              <StatusStrip />
              <TagStrip />
              <MessageList />
              <ComposeBox />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777777', fontSize: 14 }}>
              Seleccioná una conversación para empezar
            </div>
          )}
        </section>
        {activeConversation && <InfoPanel />}
      </div>
    </div>
  );
}