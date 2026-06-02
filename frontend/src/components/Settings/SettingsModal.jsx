import { useState, useEffect } from 'react';
import {
  getChannelConfigs, upsertChannelConfig, disconnectChannel,
  getAiBotConfig, saveAiBotConfig, testAiBotConn,
} from '../../services/api';

// ── Config de cada canal ──────────────────────────────────────────────────────
const CHANNELS = [
  {
    key:   'WHATSAPP',
    label: 'WhatsApp Business',
    icon:  'fa-brands fa-whatsapp',
    color: '#25d366',
    bg:    'rgba(37,211,102,.12)',
    fields: [
      { key: 'phoneNumberId',      label: 'Phone Number ID',       placeholder: '1234567890',       help: 'ID del número en Meta Business Manager' },
      { key: 'wabaId',             label: 'WABA ID',               placeholder: '9876543210',       help: 'WhatsApp Business Account ID' },
      { key: 'accessToken',        label: 'Access Token',          placeholder: 'EAAxxxxx…',        help: 'Token de sistema o token de página' },
      { key: 'webhookVerifyToken', label: 'Webhook Verify Token',  placeholder: 'mi-token-secreto', help: 'Palabra clave para verificar el webhook en Meta' },
    ],
  },
  {
    key:   'INSTAGRAM',
    label: 'Instagram Business',
    icon:  'fa-brands fa-instagram',
    color: '#e1306c',
    bg:    'rgba(225,48,108,.12)',
    fields: [
      { key: 'pageId',             label: 'Page ID',               placeholder: '1234567890',       help: 'ID de la página de Facebook conectada' },
      { key: 'accessToken',        label: 'Access Token',          placeholder: 'EAAxxxxx…',        help: 'Token de página con permisos instagram_manage_messages' },
      { key: 'webhookVerifyToken', label: 'Webhook Verify Token',  placeholder: 'mi-token-secreto', help: 'Palabra clave para verificar el webhook en Meta' },
    ],
  },
  {
    key:   'MESSENGER',
    label: 'Facebook Messenger',
    icon:  'fa-brands fa-facebook-messenger',
    color: '#0084ff',
    bg:    'rgba(0,132,255,.12)',
    fields: [
      { key: 'pageId',             label: 'Page ID',               placeholder: '1234567890',       help: 'ID de la página de Facebook' },
      { key: 'accessToken',        label: 'Access Token',          placeholder: 'EAAxxxxx…',        help: 'Token de página con permisos messages' },
      { key: 'webhookVerifyToken', label: 'Webhook Verify Token',  placeholder: 'mi-token-secreto', help: 'Palabra clave para verificar el webhook en Meta' },
    ],
  },
];

// ── Tarjeta de canal ──────────────────────────────────────────────────────────
function ChannelCard({ channel, config, onSave, onDisconnect }) {
  const [open,      setOpen]      = useState(false);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [showToken, setShowToken] = useState(false);
  const isActive = config?.isActive ?? false;

  useEffect(() => {
    if (!open) return;
    const initial = {};
    channel.fields.forEach(f => {
      if (f.key === 'webhookVerifyToken') {
        // Si ya tiene token guardado, usarlo; si no, generar uno automáticamente
        initial[f.key] = config?.[f.key] || generateVerifyToken();
      } else {
        initial[f.key] = config?.[f.key] ?? '';
      }
    });
    setForm(initial);
  }, [open]);

  const generateVerifyToken = () => {
    const arr = new Uint8Array(18);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ channel: channel.key, ...form });
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
    } finally { setSaving(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm(`¿Desconectar ${channel.label}?`)) return;
    await onDisconnect(channel.key);
    setOpen(false);
  };

  return (
    <div style={{ border: `1px solid ${open ? channel.color + '55' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer', background: open ? channel.bg : 'transparent', transition: 'background .2s' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: channel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: channel.color, flexShrink: 0 }}>
          <i className={channel.icon} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)' }}>{channel.label}</div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>
            {isActive ? <><span style={{ color: '#4caf50' }}>● </span>Conectado</> : <><span style={{ color: 'var(--dim)' }}>○ </span>Sin configurar</>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isActive && <span style={{ background: 'rgba(76,175,80,.15)', color: '#4caf50', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, border: '1px solid rgba(76,175,80,.3)' }}>ACTIVO</span>}
          <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--dim)', fontSize: 12 }} />
        </div>
      </div>

      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
          {/* Input trampa: evita que el navegador rellene los campos reales con credenciales guardadas */}
          <input type="text"     autoComplete="username" style={{ display: 'none' }} aria-hidden="true" readOnly />
          <input type="password" autoComplete="current-password" style={{ display: 'none' }} aria-hidden="true" readOnly />

          <div style={{ margin: '14px 0 16px' }}>
            <label style={sty.label}>URL del Webhook</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={`${window.location.origin}/api/webhooks/${channel.key.toLowerCase()}`} style={{ ...sty.input, color: 'var(--dim)', fontSize: 12, flex: 1 }} autoComplete="off" />
              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/${channel.key.toLowerCase()}`)} style={sty.copyBtn} title="Copiar"><i className="fa-regular fa-copy" /></button>
            </div>
            <div style={sty.help}>Pegá esta URL en Meta Developers → Webhooks</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {channel.fields.map(field => (
              <div key={field.key}>
                <label style={sty.label}>{field.label}</label>
                {field.key === 'webhookVerifyToken' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      readOnly
                      value={form[field.key] ?? ''}
                      autoComplete="off"
                      style={{ ...sty.input, color: 'var(--dim)', fontSize: 12, flex: 1, fontFamily: 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(form[field.key] ?? '')}
                      style={sty.copyBtn}
                      title="Copiar token"
                    >
                      <i className="fa-regular fa-copy" />
                    </button>
                  </div>
                ) : field.key === 'accessToken' ? (
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={form[field.key] ?? ''}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      autoComplete="new-password"
                      style={{ ...sty.input, paddingRight: 38 }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowToken(v => !v)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: '0 2px', fontSize: 13 }}
                    >
                      <i className={`fa-regular ${showToken ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                ) : (
                  <input type="text" value={form[field.key] ?? ''} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder} autoComplete="off" style={sty.input} />
                )}
                <div style={sty.help}>{field.help}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={handleSave} disabled={saving || saved} style={sty.saveBtn}>
              {saved ? <><i className="fa-solid fa-check" style={{ marginRight: 7 }} />Guardado</> : saving ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 7 }} />Guardando…</> : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 7 }} />Guardar y conectar</>}
            </button>
            {isActive && <button onClick={handleDisconnect} style={sty.disconnectBtn}><i className="fa-solid fa-plug-circle-xmark" style={{ marginRight: 7 }} />Desconectar</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sección n8n (solo uso interno / avanzado — no se muestra al cliente) ──────
// eslint-disable-next-line no-unused-vars
function N8nSection() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secret,     setSecret]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState('');

  const callbackUrl = `${window.location.protocol}//${window.location.hostname}:3000/api/n8n/message`;

  useEffect(() => {
    getN8nConfig()
      .then(cfg => { setWebhookUrl(cfg?.n8nWebhookUrl ?? ''); setSecret(cfg?.n8nSecret ?? ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await saveN8nConfig({ webhookUrl: webhookUrl || null, secret: secret || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { setError('Error al guardar la configuración'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 32, color: 'var(--dim)' }}><i className="fa-solid fa-circle-notch fa-spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Info card */}
      <div style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-robot" style={{ color: '#818cf8', fontSize: 15 }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)' }}>¿Qué hace n8n?</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--cream-dim)', lineHeight: 1.7 }}>
          n8n recibe los mensajes entrantes de tus clientes y ejecuta la lógica del bot automáticamente:
          menú de bienvenida, respuestas a opciones, mensajes de recuperación a las 24hs, y más.
          Todo configurable visualmente sin código.
        </div>
      </div>

      {/* Flujo visual */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--cream-dim)', marginBottom: 10 }}>Flujo de mensajes</div>
        {[
          { icon: 'fa-solid fa-comment', color: '#25d366', text: 'Cliente manda un mensaje' },
          { icon: 'fa-solid fa-arrow-down', color: 'var(--dim)', text: null },
          { icon: 'fa-solid fa-globe', color: 'var(--red)', text: 'ORBIS lo recibe y guarda' },
          { icon: 'fa-solid fa-arrow-down', color: 'var(--dim)', text: null },
          { icon: 'fa-solid fa-robot', color: '#818cf8', text: 'ORBIS avisa a n8n (webhook)' },
          { icon: 'fa-solid fa-arrow-down', color: 'var(--dim)', text: null },
          { icon: 'fa-solid fa-bolt', color: '#f59e0b', text: 'n8n ejecuta tu flujo (bot, IA, etc.)' },
          { icon: 'fa-solid fa-arrow-down', color: 'var(--dim)', text: null },
          { icon: 'fa-solid fa-reply', color: '#818cf8', text: 'n8n devuelve la respuesta a ORBIS' },
        ].map((step, i) => (
          step.text
            ? <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={step.icon} style={{ color: step.color, fontSize: 12 }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--cream-dim)' }}>{step.text}</span>
              </div>
            : <div key={i} style={{ paddingLeft: 9, color: 'var(--dim)', fontSize: 11, marginBottom: 4 }}>↓</div>
        ))}
      </div>

      {/* URL de callback (read-only) */}
      <div>
        <label style={sty.label}>URL de callback (n8n → ORBIS)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly value={callbackUrl} style={{ ...sty.input, color: 'var(--dim)', fontSize: 12, flex: 1 }} />
          <button onClick={() => navigator.clipboard.writeText(callbackUrl)} style={sty.copyBtn} title="Copiar"><i className="fa-regular fa-copy" /></button>
        </div>
        <div style={sty.help}>Usá esta URL en el nodo "HTTP Request" de n8n para devolver la respuesta</div>
      </div>

      {/* Webhook URL de n8n */}
      <div>
        <label style={sty.label}>Webhook URL de n8n</label>
        <input
          type="text" value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://tu-n8n.com/webhook/abc123"
          style={sty.input}
        />
        <div style={sty.help}>La URL que te da n8n al crear un nodo Webhook</div>
      </div>

      {/* Secret compartido */}
      <div>
        <label style={sty.label}>Secret compartido</label>
        <input
          type="text" value={secret}
          onChange={e => setSecret(e.target.value)}
          placeholder="una-palabra-clave-secreta"
          style={sty.input}
        />
        <div style={sty.help}>
          ORBIS lo envía a n8n en cada evento. n8n debe devolverlo en el header
          <code style={{ background: 'var(--bg3)', padding: '1px 5px', borderRadius: 4, marginLeft: 4, fontSize: 11 }}>X-Orbis-Secret</code>
        </div>
      </div>

      {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 7, padding: '9px 13px', color: 'var(--red-light)', fontSize: 13 }}>{error}</div>}

      <button onClick={handleSave} disabled={saving} style={sty.saveBtn}>
        {saved    ? <><i className="fa-solid fa-check" style={{ marginRight: 8 }} />Guardado</>
         : saving ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Guardando…</>
                  : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 8 }} />Guardar configuración</>}
      </button>

      {/* Guía de n8n */}
      <details style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <summary style={{ padding: '13px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--cream-dim)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><i className="fa-solid fa-book" style={{ marginRight: 8, color: '#818cf8' }} />Cómo configurar n8n paso a paso</span>
          <i className="fa-solid fa-chevron-down" style={{ fontSize: 11, color: 'var(--dim)' }} />
        </summary>
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          {[
            { n: 1, title: 'Instalá n8n', desc: 'La forma más fácil es con npx:', code: 'npx n8n' },
            { n: 2, title: 'Creá un nuevo workflow', desc: 'En n8n, creá un flujo y agregá un nodo "Webhook" como trigger.' },
            { n: 3, title: 'Copiá la Webhook URL', desc: 'n8n te da una URL como https://localhost:5678/webhook/xxx. Pegala en el campo de arriba.' },
            { n: 4, title: 'Agregá lógica con nodos IF', desc: 'Usá "IF" para detectar si es el primer mensaje (campo isFirstMessage = true) y enviar el menú de bienvenida.' },
            { n: 5, title: 'Respondé con HTTP Request', desc: 'Agregá un nodo "HTTP Request" → POST → URL de callback de arriba. En el body incluí conversationId, tenantId, content y el header X-Orbis-Secret.', code: JSON.stringify({ conversationId: '={{$json.conversationId}}', tenantId: '={{$json.tenantId}}', content: 'Hola! 👋 ¿En qué te ayudo?' }, null, 2) },
          ].map(step => (
            <div key={step.n} style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#818cf8', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step.n}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>{step.title}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--cream-dim)', margin: '0 0 6px 28px', lineHeight: 1.6 }}>{step.desc}</p>
              {step.code && <pre style={{ margin: '0 0 0 28px', background: 'var(--bg3)', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: 'var(--cream-dim)', overflowX: 'auto' }}>{step.code}</pre>}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// ── Sección Bot IA ────────────────────────────────────────────────────────────
function AiBotSection() {
  const [cfg,        setCfg]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [testing,    setTesting]    = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error,      setError]      = useState('');

  useEffect(() => {
    getAiBotConfig()
      .then(data => setCfg(data || { isActive: false, businessContext: '', handoffMessage: 'Perfecto, te estoy conectando con uno de nuestros asesores ahora mismo 🤝 En breve te contactan.' }))
      .catch(() => setCfg({ isActive: false, businessContext: '', handoffMessage: '' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!cfg.businessContext?.trim()) { setError('Describí tu negocio antes de guardar'); return; }
    setSaving(true); setError(''); setSaved(false);
    try {
      const updated = await saveAiBotConfig(cfg);
      setCfg(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { setError('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const result = await testAiBotConn();
      setTestResult(result);
    } catch { setTestResult({ ok: false, error: 'No se pudo conectar' }); }
    finally { setTesting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 32, color: 'var(--dim)' }}><i className="fa-solid fa-circle-notch fa-spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Estado de conexión OpenAI */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16,185,129,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-brain" style={{ color: '#10b981', fontSize: 15 }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>OpenAI GPT-4o-mini</div>
              <div style={{ fontSize: 11, color: 'var(--dim)' }}>Modelo de lenguaje del bot</div>
            </div>
          </div>
          <button onClick={handleTest} disabled={testing} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, color: 'var(--cream-dim)', fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>
            {testing ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Probando…</> : 'Probar conexión'}
          </button>
        </div>
        {testResult && (
          <div style={{ marginTop: 10, fontSize: 12, padding: '8px 10px', borderRadius: 6, background: testResult.ok ? 'rgba(16,185,129,.1)' : 'var(--red-bg)', color: testResult.ok ? '#10b981' : 'var(--red-light)', border: `1px solid ${testResult.ok ? 'rgba(16,185,129,.3)' : 'var(--red-border)'}` }}>
            {testResult.ok
              ? <><i className="fa-solid fa-check" style={{ marginRight: 7 }} />Conexión exitosa con OpenAI</>
              : <><i className="fa-solid fa-xmark" style={{ marginRight: 7 }} />{testResult.error}</>
            }
          </div>
        )}
      </div>

      {/* Toggle activo/inactivo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>Bot activo</div>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>El bot responde automáticamente los mensajes entrantes</div>
        </div>
        <div
          onClick={() => setCfg(c => ({ ...c, isActive: !c.isActive }))}
          style={{ width: 44, height: 24, borderRadius: 12, background: cfg.isActive ? 'var(--red)' : 'var(--bg3)', border: '1px solid var(--border2)', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}
        >
          <div style={{ position: 'absolute', top: 3, left: cfg.isActive ? 22 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
        </div>
      </div>

      {/* Descripción del negocio */}
      <div>
        <label style={sty.label}>Descripción de tu negocio <span style={{ color: 'var(--red)' }}>*</span></label>
        <textarea
          value={cfg.businessContext}
          onChange={e => setCfg(c => ({ ...c, businessContext: e.target.value }))}
          rows={7}
          placeholder={`Ejemplos:\n\n• "Somos una inmobiliaria en Resistencia, Chaco. Alquilamos y vendemos propiedades. Tenemos departamentos de 1, 2 y 3 ambientes en distintas zonas. Trabajamos de lunes a viernes de 9 a 18hs."\n\n• "Somos una tienda de ropa femenina. Vendemos talles S al XL. El envío tarda 3-5 días hábiles..."`}
          style={{ ...sty.input, resize: 'vertical', lineHeight: 1.6 }}
        />
        <div style={sty.help}>Cuanto más detallada sea la descripción, mejor responde el bot. Incluí productos, precios, horarios, zonas de cobertura, etc.</div>
      </div>

      {/* Tip descripción completa */}
      <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,.08) 0%, rgba(251,191,36,.05) 100%)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(245,158,11,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: '#f59e0b', fontSize: 14 }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>
              Cuanto más completa sea tu descripción, mejor responde tu bot
            </div>
            <div style={{ fontSize: 12, color: 'var(--cream-dim)', lineHeight: 1.75 }}>
              Incluí todo lo que un cliente podría preguntar:
            </div>
            <ul style={{ margin: '6px 0 0 0', padding: '0 0 0 16px', fontSize: 12, color: 'var(--cream-dim)', lineHeight: 1.9 }}>
              <li><strong>Productos o servicios</strong> — qué ofrecés, precios, variantes disponibles</li>
              <li><strong>Horarios</strong> — días y horas de atención, feriados, urgencias</li>
              <li><strong>Ubicación</strong> — dirección, zona de cobertura, envíos</li>
              <li><strong>Políticas</strong> — devoluciones, garantías, formas de pago</li>
              <li><strong>Contacto y redes</strong> — mail, Instagram, web, etc.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mensaje de derivación */}
      <div>
        <label style={sty.label}>Mensaje al derivar a un agente</label>
        <textarea
          value={cfg.handoffMessage}
          onChange={e => setCfg(c => ({ ...c, handoffMessage: e.target.value }))}
          rows={2}
          style={{ ...sty.input, resize: 'vertical' }}
        />
        <div style={sty.help}>Este mensaje se envía cuando el bot decide que necesita intervención humana.</div>
      </div>

      {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 7, padding: '9px 13px', color: 'var(--red-light)', fontSize: 13 }}>{error}</div>}

      <button onClick={handleSave} disabled={saving} style={sty.saveBtn}>
        {saved    ? <><i className="fa-solid fa-check" style={{ marginRight: 8 }} />Guardado</>
         : saving ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Guardando…</>
                  : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 8 }} />Guardar configuración</>}
      </button>

      {/* Tip de cómo funciona la derivación */}
      <div style={{ background: 'rgba(99,102,241,.07)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: 'var(--cream-dim)', lineHeight: 1.7 }}>
        <i className="fa-solid fa-circle-info" style={{ color: '#818cf8', marginRight: 8 }} />
        <strong>¿Cuándo deriva a un humano?</strong> Cuando el cliente lo pide explícitamente, cuando quiere cerrar una venta/operación, o cuando el bot no puede responder correctamente. Al derivar, la conversación queda marcada como <strong>En curso</strong> y aparece destacada en tu bandeja.
      </div>
    </div>
  );
}

// ── Modal principal con tabs ──────────────────────────────────────────────────
export default function SettingsModal({ onClose }) {
  const [tab,     setTab]     = useState('channels'); // 'channels' | 'n8n'
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChannelConfigs()
      .then(setConfigs).catch(() => setConfigs([]))
      .finally(() => setLoading(false));
  }, []);

  const getConfig = (key)  => configs.find(c => c.channel === key) ?? null;

  const handleSave = async (data) => {
    const updated = await upsertChannelConfig(data);
    setConfigs(prev => {
      const idx = prev.findIndex(c => c.channel === data.channel);
      return idx >= 0 ? prev.map((c, i) => i === idx ? updated : c) : [...prev, updated];
    });
  };

  const handleDisconnect = async (key) => {
    const updated = await disconnectChannel(key);
    setConfigs(prev => prev.map(c => c.channel === key ? updated : c));
  };

  const TABS = [
    { key: 'channels', label: 'Canales', icon: 'fa-solid fa-plug' },
    { key: 'bot',      label: 'Bot IA',  icon: 'fa-solid fa-robot' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, backdropFilter: 'blur(2px)' }} />

      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 500, background: 'var(--bg1)', borderLeft: '1px solid var(--border)', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,.4)', animation: 'slideInRight .22s ease-out' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cream)', fontFamily: "'Syne', sans-serif" }}>Configuración</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>Canales de mensajería y automatizaciones</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 18, padding: 6 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.key ? 'var(--red)' : 'transparent'}`, color: tab === t.key ? 'var(--cream)' : 'var(--dim)', fontSize: 13, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .15s' }}>
              <i className={t.icon} style={{ fontSize: 13 }} /> {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 24px' }}>
          {tab === 'channels' && (
            <>
              <div style={{ margin: '0 0 14px', padding: '11px 13px', background: 'rgba(255,193,7,.07)', border: '1px solid rgba(255,193,7,.2)', borderRadius: 8, fontSize: 12, color: 'var(--cream-dim)', lineHeight: 1.6 }}>
                <i className="fa-solid fa-circle-info" style={{ color: '#ffc107', marginRight: 8 }} />
                Necesitás una <strong>cuenta de Meta Business</strong>. Tokens en{' '}
                <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" style={{ color: '#ffc107' }}>developers.facebook.com</a>.
              </div>
              {loading
                ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--dim)' }}><i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 22 }} /></div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {CHANNELS.map(ch => <ChannelCard key={ch.key} channel={ch} config={getConfig(ch.key)} onSave={handleSave} onDisconnect={handleDisconnect} />)}
                  </div>
              }
            </>
          )}
          {tab === 'bot' && <AiBotSection />}
        </div>
      </div>

      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  );
}

// ── Estilos compartidos ───────────────────────────────────────────────────────
const sty = {
  label:        { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--cream-dim)', marginBottom: 5 },
  input:        { width: '100%', boxSizing: 'border-box', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, padding: '9px 12px', color: 'var(--cream)', fontSize: 13, outline: 'none' },
  help:         { fontSize: 11, color: 'var(--dim)', marginTop: 4 },
  copyBtn:      { background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, color: 'var(--dim)', cursor: 'pointer', padding: '9px 12px', fontSize: 13, flexShrink: 0 },
  saveBtn:      { width: '100%', background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 0', cursor: 'pointer', fontFamily: "'Syne', sans-serif" },
  disconnectBtn:{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--dim)', fontSize: 13, padding: '10px 16px', cursor: 'pointer' },
};
