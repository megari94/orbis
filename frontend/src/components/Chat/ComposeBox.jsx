import { useState, useRef } from 'react';
import useStore from '../../store/useStore';
import api from '../../services/api';

export default function ComposeBox() {
  const [text,    setText]    = useState('');
  const [preview, setPreview] = useState(null); // { file, url, type }
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const { sendMessage, activeConversation } = useStore();

  // ── Selección de archivo ──────────────────────────────────────────────────
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url  = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image'
               : file.type.startsWith('video/') ? 'video'
               : 'file';
    setPreview({ file, url, type, name: file.name });
    e.target.value = ''; // reset para poder volver a elegir el mismo archivo
  };

  const clearPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  // ── Envío ─────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      if (preview) {
        // Enviar archivo
        const form = new FormData();
        form.append('file', preview.file);
        await api.post(
          `/conversations/${activeConversation.id}/messages/media`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        clearPreview();
      } else {
        const t = text.trim();
        if (!t) return;
        setText('');
        await sendMessage(t);
      }
    } catch (err) {
      console.error('Error enviando:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const canSend = !sending && (preview || text.trim().length > 0);

  return (
    <div className="compose">
      {/* Preview del archivo seleccionado */}
      {preview && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px',
          background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        }}>
          {preview.type === 'image' && (
            <img src={preview.url} alt="preview"
              style={{ height: 56, borderRadius: 6, objectFit: 'cover', maxWidth: 100 }} />
          )}
          {preview.type === 'video' && (
            <video src={preview.url}
              style={{ height: 56, borderRadius: 6 }} />
          )}
          {preview.type === 'file' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cream-dim)' }}>
              <i className="fa-solid fa-file" style={{ fontSize: 22, color: 'var(--dim)' }} />
              <span style={{ fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {preview.name}
              </span>
            </div>
          )}
          <button
            onClick={clearPreview}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 16 }}
            title="Quitar archivo"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      <div className="input-row">
        {/* Input de archivo oculto */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />

        {/* Clip — abre el selector de archivos */}
        <button
          className="attach-btn"
          title="Adjuntar archivo"
          onClick={() => fileRef.current?.click()}
          disabled={sending}
        >
          <i className="fa-solid fa-paperclip" />
        </button>

        <textarea
          className="compose-txt"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          disabled={!!preview || sending}
          placeholder={preview ? preview.name : 'Escribí tu respuesta…'}
        />

        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!canSend}
          title="Enviar"
          style={{ opacity: canSend ? 1 : 0.5 }}
        >
          {sending
            ? <i className="fa-solid fa-circle-notch fa-spin" />
            : <i className="fa-solid fa-paper-plane" />
          }
        </button>
      </div>
    </div>
  );
}
