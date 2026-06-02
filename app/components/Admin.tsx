'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { FolderRow, PhotoRow, OrderRow } from '@/lib/supabase/types';
import type { Screen } from './Header';

// ─── helpers ────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const { data } = await getSupabaseClient().auth.getSession();
  return data.session?.access_token ?? '';
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  return fetch(path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> ?? {}),
    },
  });
}

// ─── Login ──────────────────────────────────────────────────────────────────

interface LoginProps {
  onNavigate: (to: Screen) => void;
  onLogin: () => void;
}

export function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authErr } = await getSupabaseClient().auth.signInWithPassword({ email, password: pw });
    if (authErr) {
      setError('E-mail ou senha incorretos.');
    }
    // onLogin será chamado pelo onAuthStateChange no App.tsx
    setLoading(false);
  };

  return (
    <div className="login fade-in">
      <div className="login-art">
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--bg-soft) 0%, var(--bg) 100%)' }} />
        <div className="grain" />
        <div className="login-art-cap">
          <small>● Acesso · Aleen Studio</small>
          O <i>back-office</i><br />do estúdio.
        </div>
      </div>
      <div className="login-form">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 18 }}>
          <a onClick={() => onNavigate('home')} style={{ cursor: 'pointer', color: 'var(--fg-soft)' }}>← Voltar ao site</a>
        </div>
        <h1>Entrar como <i>admin</i>.</h1>
        <div className="sub">Somente Aleen · 1 sessão ativa</div>

        <form onSubmit={handleSubmit}>
          <div className="co-fld">
            <label>E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoFocus />
          </div>
          <div className="co-fld">
            <label>Senha</label>
            <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="••••••••" required />
          </div>
          {error && (
            <div style={{ color: 'oklch(0.6 0.18 25)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{error}</div>
          )}
          <button type="submit" className="btn-solid" style={{ width: '100%', padding: 16, justifyContent: 'center', fontSize: 12, marginTop: 8 }} disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar painel →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Spark sparkline ─────────────────────────────────────────────────────────

function Spark({ data, color }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 100, h = 36;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / (max - min || 1)) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <polyline points={pts} fill="none" stroke={color || 'var(--accent)'} strokeWidth="1.5" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color || 'var(--accent)'} opacity={0.1} stroke="none" />
    </svg>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ onSetPage }: { onSetPage: (p: AdminPage) => void }) {
  const [stats, setStats] = useState({ folders: 0, photos: 0, orders: 0, revenue: 0 });
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    adminFetch('/api/admin/stats').then((r) => r.json()).then((d) => {
      if (d.revenue !== undefined) setStats(d);
    });
    adminFetch('/api/admin/orders?limit=5').then((r) => r.json()).then((d) => {
      if (d.orders) setOrders(d.orders);
    });
  }, []);

  const formatWhen = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `há ${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `há ${h}h`;
    return `há ${Math.floor(h / 24)}d`;
  };

  return (
    <div className="fade-in">
      <div className="admin-bar">
        <h1>Bom dia, <i>Aleen</i>.</h1>
        <div className="actions">
          <button className="btn-solid" onClick={() => onSetPage('upload')}>＋ Nova publicação</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <b>Receita total</b>
          <div className="v">R$ <i>{stats.revenue.toLocaleString('pt-BR')}</i></div>
          <div className="d"><span className="up">{stats.orders} pedidos pagos</span></div>
          <div className="spark"><Spark data={[8,9,7,11,10,13,12,15,14,16,18,20]} /></div>
        </div>
        <div className="stat">
          <b>Pastas publicadas</b>
          <div className="v"><i>{stats.folders}</i></div>
          <div className="d"><span style={{ color: 'var(--fg-mute)' }}>eventos & portfólio</span></div>
          <div className="spark"><Spark data={[3,5,4,7,6,9,8,10,11,9,12,14]} color="oklch(0.7 0.04 200)" /></div>
        </div>
        <div className="stat">
          <b>Fotos publicadas</b>
          <div className="v"><i>{stats.photos}</i></div>
          <div className="d"><span style={{ color: 'var(--fg-mute)' }}>com marca d'água</span></div>
          <div className="spark"><Spark data={[12,18,14,22,19,28,26,30,32,28,35,42]} color="oklch(0.6 0.06 80)" /></div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="panel" style={{ marginTop: 32 }}>
          <h2>Últimos pedidos</h2>
          <table className="tbl">
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th className="right">Valor</th><th className="right">Status</th><th className="right">Quando</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><span className="t">{o.order_number}</span></td>
                  <td>{o.customer_email}</td>
                  <td className="right">R$ {o.total.toFixed(2)}</td>
                  <td className="right">
                    <span className="evt-tag" data-kind={o.payment_status === 'paid' ? 'sale' : 'portfolio'} style={{ fontSize: 9 }}>
                      {o.payment_status === 'paid' ? 'Pago' : o.payment_status === 'pending' ? 'Pendente' : o.payment_status}
                    </span>
                  </td>
                  <td className="right" style={{ color: 'var(--fg-mute)' }}>{formatWhen(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Upload ──────────────────────────────────────────────────────────────────

interface UploadItem {
  id: string;
  file: File;
  pct: number;
  done: boolean;
  error?: string;
  previewUrl: string;
  watermark: boolean;
  mediaType: 'photo' | 'video';
  aspectRatio: string; // '3/4', '4/3', '1/1', '16/9', '9/16', 'auto'
}

function UploadPage() {
  const [drag, setDrag] = useState(false);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [folderId, setFolderId] = useState('');
  const [kind, setKind] = useState('portfolio');
  const [price, setPrice] = useState(80);
  const [uploading, setUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminFetch('/api/admin/folders').then((r) => r.json()).then((d) => {
      if (d.folders) {
        setFolders(d.folders);
        if (d.folders.length > 0) setFolderId(d.folders[0].id);
      }
    });
  }, []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: UploadItem[] = Array.from(files).map((f) => {
      const isVideo = f.type.startsWith('video/');
      return {
        id: crypto.randomUUID(),
        file: f,
        pct: 0,
        done: false,
        previewUrl: URL.createObjectURL(f),
        watermark: !isVideo, // videos don't get watermark
        mediaType: isVideo ? 'video' : 'photo',
        aspectRatio: isVideo ? '16/9' : 'auto',
      };
    });
    setQueue((q) => [...q, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!folderId || queue.length === 0 || uploading) return;
    setUploading(true);

    const pending = queue.filter((q) => !q.done && !q.error);
    for (const item of pending) {
      const fd = new FormData();
      fd.append('file', item.file);
      fd.append('folder_id', folderId);
      fd.append('price', kind === 'sale' ? String(price) : '');
      fd.append('has_watermark', item.watermark ? 'true' : 'false');
      fd.append('aspect_ratio', item.aspectRatio);
      fd.append('media_type', item.mediaType);

      // Mostra "enviando"
      setQueue((q) => q.map((x) => x.id === item.id ? { ...x, pct: 10 } : x));

      const token = await getToken();

      // Simula progresso enquanto aguarda resposta do servidor
      const ticker = setInterval(() => {
        setQueue((q) => q.map((x) => x.id === item.id && x.pct < 80 ? { ...x, pct: x.pct + 5 } : x));
      }, 400);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        clearInterval(ticker);

        if (res.ok) {
          setQueue((q) => q.map((x) => x.id === item.id ? { ...x, pct: 100, done: true } : x));
        } else {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          setQueue((q) => q.map((x) => x.id === item.id ? { ...x, error: err.error ?? 'Erro no servidor', pct: 0 } : x));
        }
      } catch {
        clearInterval(ticker);
        setQueue((q) => q.map((x) => x.id === item.id ? { ...x, error: 'Falha de rede', pct: 0 } : x));
      }
    }

    setUploading(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const slug = newFolderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const res = await adminFetch('/api/admin/folders', {
      method: 'POST',
      body: JSON.stringify({ name: newFolderName, slug, kind, published: false }),
    });
    const data = await res.json();
    if (data.folder) {
      setFolders((f) => [data.folder, ...f]);
      setFolderId(data.folder.id);
      setShowNewFolder(false);
      setNewFolderName('');
    }
  };

  const doneCount = queue.filter((q) => q.done).length;

  return (
    <div className="fade-in">
      <div className="admin-bar">
        <h1>Publicar <i>novo</i></h1>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => addFiles(e.target.files)}
      />

      <div
        className="dz"
        data-drag={drag.toString()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        <div className="icon">+</div>
        <h3>Arraste fotos aqui ou clique para selecionar</h3>
        <p>JPG · PNG · WEBP · MP4 · MOV · até 500 MB por arquivo</p>
      </div>

      {queue.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, marginTop: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0, fontWeight: 400 }}>
              Fila <i style={{ color: 'var(--accent)', fontStyle: 'italic' }}>·</i> {queue.length}
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
              {doneCount} de {queue.length} prontas
            </span>
          </div>
          {/* Controle global de marca d'água */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>Marca d&apos;água:</span>
            <button
              className="btn-ghost"
              style={{ padding: '3px 10px', fontSize: 10 }}
              onClick={() => setQueue((q) => q.map((x) => x.done ? x : { ...x, watermark: true }))}
            >Todas ✓</button>
            <button
              className="btn-ghost"
              style={{ padding: '3px 10px', fontSize: 10 }}
              onClick={() => setQueue((q) => q.map((x) => x.done ? x : { ...x, watermark: false }))}
            >Nenhuma ×</button>
          </div>

          <div className="upload-queue">
            {queue.map((q) => (
              <div key={q.id} className="upq" data-done={q.done.toString()} data-error={!!q.error}>
                <div style={{ position: 'relative' }}>
                  {q.mediaType === 'video' ? (
                    <div style={{ width: '100%', aspectRatio: '1', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <span style={{ fontSize: 28, opacity: 0.4 }}>▶</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--fg-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>vídeo</span>
                    </div>
                  ) : (
                    <img src={q.previewUrl} alt="" />
                  )}
                  {/* Watermark badge - only for photos */}
                  {!q.done && !q.error && q.mediaType === 'photo' && (
                    <button
                      onClick={() => setQueue((prev) => prev.map((x) => x.id === q.id ? { ...x, watermark: !x.watermark } : x))}
                      title={q.watermark ? "Remover marca d'água" : "Adicionar marca d'água"}
                      style={{
                        position: 'absolute', bottom: 4, right: 4,
                        background: q.watermark ? 'rgba(0,0,0,0.75)' : 'rgba(80,0,0,0.75)',
                        border: '1px solid ' + (q.watermark ? 'rgba(255,255,255,0.3)' : 'oklch(0.75 0.08 25)'),
                        color: q.watermark ? 'rgba(255,255,255,0.85)' : 'oklch(0.75 0.18 25)',
                        fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.08em',
                        textTransform: 'uppercase', padding: '2px 5px', cursor: 'pointer', lineHeight: 1.4,
                      }}
                    >
                      {q.watermark ? '© MDA' : '○ sem'}
                    </button>
                  )}
                </div>
                <div className="meta">
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{q.file.name}</span>
                  <span className="pct" style={{ color: q.error ? 'oklch(0.6 0.18 25)' : undefined }}>
                    {q.error ? '✗' : q.done ? '✓' : q.pct > 0 ? Math.round(q.pct) + '%' : ''}
                  </span>
                </div>
                {/* Aspect ratio selector */}
                {!q.done && !q.error && (
                  <select
                    value={q.aspectRatio}
                    onChange={(e) => setQueue((prev) => prev.map((x) => x.id === q.id ? { ...x, aspectRatio: e.target.value } : x))}
                    style={{ fontSize: 9, fontFamily: 'var(--font-mono)', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--fg-mute)', padding: '2px 4px', letterSpacing: '0.06em', width: '100%' }}
                  >
                    <option value="auto">Auto</option>
                    <option value="1/1">1:1 — Square</option>
                    <option value="3/4">3:4 — Retrato</option>
                    <option value="4/5">4:5 — Instagram</option>
                    <option value="2/3">2:3 — Clássico</option>
                    <option value="4/3">4:3 — Paisagem</option>
                    <option value="3/2">3:2 — Foto 35mm</option>
                    <option value="16/9">16:9 — Cinemascope</option>
                    <option value="9/16">9:16 — Vertical</option>
                  </select>
                )}
                {q.error && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'oklch(0.6 0.18 25)', letterSpacing: '0.04em', lineHeight: 1.4, marginTop: -4 }}>
                    {q.error}
                  </div>
                )}
                <div className="bar"><i style={{ width: q.pct + '%', background: q.error ? 'oklch(0.6 0.18 25)' : undefined }} /></div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="upload-form">
        <h3>Configurar publicação</h3>
        <div className="fld full">
          <label>Tipo</label>
          <div className="segments">
            <button data-active={(kind === 'portfolio').toString()} onClick={() => setKind('portfolio')}>
              <b>Portfólio</b>
              Galeria pública sem venda.
            </button>
            <button data-active={(kind === 'sale').toString()} onClick={() => setKind('sale')}>
              <b>À venda</b>
              Clientes compram fotos individualmente.
            </button>
          </div>
        </div>

        <div className="fld">
          <label>Pasta / Evento</label>
          <select value={folderId} onChange={(e) => {
            if (e.target.value === '__new') { setShowNewFolder(true); }
            else setFolderId(e.target.value);
          }}>
            {folders.length === 0 && <option value="">— Nenhuma pasta ainda —</option>}
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            <option value="__new">＋ Criar nova pasta…</option>
          </select>
          {folders.length === 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.65 0.12 60)', letterSpacing: '0.06em' }}>
              Crie uma pasta antes de enviar fotos.
            </span>
          )}
        </div>

        {showNewFolder && (
          <div className="fld" style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Nome da pasta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn-solid" style={{ padding: '0 16px', whiteSpace: 'nowrap' }} onClick={createFolder}>Criar</button>
            <button className="btn-ghost" style={{ padding: '0 12px' }} onClick={() => setShowNewFolder(false)}>×</button>
          </div>
        )}

        {kind === 'sale' && (
          <div className="fld">
            <label>Preço por foto (R$)</label>
            <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} min={1} />
          </div>
        )}

        <div className="save">
          <button className="btn-ghost" onClick={() => setQueue([])}>Limpar fila</button>
          <button
            className="btn-solid"
            onClick={handleUpload}
            disabled={uploading || queue.length === 0 || !folderId || doneCount === queue.length}
          >
            {uploading ? 'Enviando...' : `Publicar ${queue.filter((q) => !q.done && !q.error).length} arquivo(s) →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Folder Modal ─────────────────────────────────────────────────────────────

interface FolderFormData {
  name: string;
  slug: string;
  description: string;
  kind: 'sale' | 'portfolio';
  date: string;
  location: string;
  price_per_photo: string;
  published: boolean;
  locked: boolean;
  password: string;
}

const emptyFolder = (): FolderFormData => ({
  name: '', slug: '', description: '', kind: 'portfolio',
  date: '', location: '', price_per_photo: '', published: false,
  locked: false, password: '',
});

function FolderModal({
  folder,
  onSave,
  onClose,
}: {
  folder: FolderRow | null;
  onSave: (data: FolderFormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FolderFormData>(
    folder
      ? {
          name: folder.name,
          slug: folder.slug,
          description: folder.description ?? '',
          kind: folder.kind,
          date: folder.date ?? '',
          location: folder.location ?? '',
          price_per_photo: folder.price_per_photo ? String(folder.price_per_photo) : '',
          published: folder.published,
          locked: folder.locked,
          password: '',
        }
      : emptyFolder()
  );
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FolderFormData, v: FolderFormData[keyof FolderFormData]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line-strong)', padding: 32, maxWidth: 560, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, margin: 0 }}>
            {folder ? 'Editar' : 'Nova'} <i>pasta</i>
          </h2>
          <button className="btn-ghost" style={{ padding: '4px 12px' }} onClick={onClose}>×</button>
        </div>

        <div className="upload-form" style={{ background: 'transparent', border: 0, padding: 0 }}>
          <div className="fld"><label>Nome *</label>
            <input value={form.name} onChange={(e) => {
              set('name', e.target.value);
              if (!folder) set('slug', autoSlug(e.target.value));
            }} placeholder="Helena & Rafael" />
          </div>
          <div className="fld"><label>Slug (URL) *</label>
            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="helena-e-rafael" />
          </div>
          <div className="fld full"><label>Descrição</label>
            <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Casamento · Fazenda Capivari" />
          </div>
          <div className="fld">
            <label>Tipo</label>
            <select value={form.kind} onChange={(e) => set('kind', e.target.value as 'sale' | 'portfolio')}>
              <option value="portfolio">Portfólio</option>
              <option value="sale">À venda</option>
            </select>
          </div>
          <div className="fld"><label>Data</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="fld"><label>Local</label>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="São Paulo, SP" />
          </div>
          {form.kind === 'sale' && (
            <div className="fld"><label>Preço por foto (R$)</label>
              <input type="number" value={form.price_per_photo} onChange={(e) => set('price_per_photo', e.target.value)} min={0} />
            </div>
          )}
          <div className="fld" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ margin: 0 }}>Publicada</label>
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
          </div>
          <div className="fld" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ margin: 0 }}>Protegida por senha</label>
            <input type="checkbox" checked={form.locked} onChange={(e) => set('locked', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
          </div>
          {form.locked && (
            <div className="fld"><label>{folder ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
            </div>
          )}

          <div className="save">
            <button className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-solid" disabled={saving} onClick={async () => {
              setSaving(true);
              await onSave(form);
              setSaving(false);
            }}>
              {saving ? 'Salvando...' : 'Salvar →'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── EventsPage ───────────────────────────────────────────────────────────────

function EventsPage() {
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [filter, setFilter] = useState('Todas');
  const [modal, setModal] = useState<'new' | FolderRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FolderRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminFetch('/api/admin/folders').then((r) => r.json()).then((d) => {
      if (d.folders) setFolders(d.folders);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const filtered = folders.filter((f) =>
    filter === 'Todas' || (filter === 'À venda' ? f.kind === 'sale' : f.kind === 'portfolio')
  );

  const handleSave = async (form: FolderFormData) => {
    const body: Record<string, unknown> = {
      name: form.name, slug: form.slug, description: form.description || null,
      kind: form.kind, date: form.date || null, location: form.location || null,
      price_per_photo: form.price_per_photo ? parseFloat(form.price_per_photo) : null,
      published: form.published, locked: form.locked,
    };
    if (form.password) body.password = form.password;

    if (typeof modal === 'object' && modal !== null && 'id' in modal) {
      await adminFetch(`/api/admin/folders/${modal.id}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await adminFetch('/api/admin/folders', { method: 'POST', body: JSON.stringify(body) });
    }
    setModal(null);
    load();
  };

  const handleDelete = async (folder: FolderRow) => {
    await adminFetch(`/api/admin/folders/${folder.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    load();
  };

  const togglePublished = async (folder: FolderRow) => {
    await adminFetch(`/api/admin/folders/${folder.id}`, {
      method: 'PUT',
      body: JSON.stringify({ published: !folder.published }),
    });
    load();
  };

  return (
    <div className="fade-in">
      <div className="admin-bar">
        <h1>Eventos & <i>pastas</i></h1>
        <div className="actions">
          <button className="btn-solid" onClick={() => setModal('new')}>＋ Nova pasta</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="gal-tabs">
          {['Todas', 'À venda', 'Portfólio'].map((t) => (
            <button key={t} data-active={(filter === t).toString()} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>{filtered.length} pastas</span>
      </div>

      {loading ? (
        <div style={{ color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 40 }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Nenhuma pasta. Clique em &quot;Nova pasta&quot; para criar.
        </div>
      ) : (
        <div className="folder-grid">
          {filtered.map((f) => (
            <div className="folder" key={f.id} style={{ position: 'relative' }}>
              <div className="thumb">
                {f.cover_url
                  ? <img src={f.cover_url} alt={f.name} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--bg-soft)', display: 'grid', placeItems: 'center', color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>sem capa</div>
                }
                <span className="badge" data-kind={f.kind}>{f.kind === 'sale' ? 'À venda' : 'Portfólio'}</span>
              </div>
              <div className="name"><i>·</i> {f.name}</div>
              <div className="row">
                <span>{f.photo_count} fotos</span>
                <span className={f.locked ? 'locked' : ''}>{f.locked ? '🔒 Privada' : f.published ? 'Pública' : 'Rascunho'}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button className="btn-ghost" style={{ flex: 1, padding: '4px 8px', fontSize: 11 }} onClick={() => setModal(f)}>Editar</button>
                <button
                  className="btn-ghost"
                  style={{ flex: 1, padding: '4px 8px', fontSize: 11, color: f.published ? 'var(--fg-mute)' : 'var(--accent)' }}
                  onClick={() => togglePublished(f)}
                >
                  {f.published ? 'Ocultar' : 'Publicar'}
                </button>
                <button
                  className="btn-ghost"
                  style={{ padding: '4px 10px', fontSize: 11, color: 'oklch(0.6 0.18 25)', borderColor: 'oklch(0.75 0.08 25)' }}
                  onClick={() => setDeleteTarget(f)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <FolderModal
          folder={typeof modal === 'string' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line-strong)', padding: 32, maxWidth: 400, width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 24, margin: '0 0 12px' }}>Deletar <i>{deleteTarget.name}</i>?</h3>
            <p style={{ color: 'var(--fg-mute)', fontSize: 13, marginBottom: 24 }}>Todas as fotos desta pasta serão removidas permanentemente. Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button
                style={{ padding: '10px 24px', background: 'oklch(0.55 0.18 25)', color: '#fff', border: 0, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer' }}
                onClick={() => handleDelete(deleteTarget)}
              >
                Deletar →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SalesPage ────────────────────────────────────────────────────────────────

function SalesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/orders?limit=50').then((r) => r.json()).then((d) => {
      if (d.orders) { setOrders(d.orders); setTotal(d.total ?? 0); }
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0);
  const paid = orders.filter((o) => o.payment_status === 'paid').length;

  const statusLabel = (s: string) => {
    if (s === 'paid') return 'Pago';
    if (s === 'pending') return 'Pendente';
    if (s === 'failed') return 'Falhou';
    return s;
  };

  return (
    <div className="fade-in">
      <div className="admin-bar">
        <h1><i>Vendas</i> & pedidos</h1>
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat"><b>Receita total</b><div className="v">R$ <i>{totalRevenue.toLocaleString('pt-BR')}</i></div></div>
        <div className="stat"><b>Pedidos pagos</b><div className="v"><i>{paid}</i></div></div>
        <div className="stat"><b>Total de pedidos</b><div className="v"><i>{total}</i></div></div>
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ padding: 40, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Carregando...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th className="right">Valor</th><th className="right">Método</th><th className="right">Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><span className="t">{o.order_number}</span></td>
                  <td>{o.customer_email}</td>
                  <td className="right">R$ {o.total.toFixed(2)}</td>
                  <td className="right" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{o.payment_method ?? '—'}</td>
                  <td className="right">
                    <span className="evt-tag" data-kind={o.payment_status === 'paid' ? 'sale' : 'portfolio'} style={{ fontSize: 9 }}>
                      {statusLabel(o.payment_status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────

function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSupabaseClient().from('settings').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r) => { map[r.key] = r.value ?? ''; });
        setSettings(map);
      }
    });
  }, []);

  const set = (k: string, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const sb = getSupabaseClient();
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        sb.from('settings').upsert({ key, value, updated_at: new Date().toISOString() })
      )
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in">
      <div className="admin-bar">
        <h1><i>Configurações</i></h1>
        <div className="actions">
          <button className="btn-solid" onClick={handleSave} disabled={saving}>
            {saved ? '✓ Salvo' : saving ? 'Salvando...' : 'Salvar →'}
          </button>
        </div>
      </div>
      <div className="admin-panels">
        <div className="panel">
          <h2>Perfil público</h2>
          <div className="upload-form" style={{ background: 'transparent', border: 0, padding: 0 }}>
            <div className="fld full"><label>Nome do estúdio</label>
              <input value={settings['site_name'] ?? ''} onChange={(e) => set('site_name', e.target.value)} />
            </div>
            <div className="fld full"><label>Bio curta</label>
              <textarea rows={3} value={settings['about_bio'] ?? ''} onChange={(e) => set('about_bio', e.target.value)} />
            </div>
            <div className="fld"><label>Email público</label>
              <input value={settings['contact_email'] ?? ''} onChange={(e) => set('contact_email', e.target.value)} />
            </div>
            <div className="fld"><label>Instagram / Marca d'água</label>
              <input value={settings['instagram_handle'] ?? ''} onChange={(e) => {
                set('instagram_handle', e.target.value);
                set('watermark_text', e.target.value);
              }} />
            </div>
          </div>
        </div>
        <div className="panel">
          <h2>Pagamentos</h2>
          <div className="upload-form" style={{ background: 'transparent', border: 0, padding: 0 }}>
            <div className="fld full"><label>Chave PIX</label>
              <input value={settings['pix_key'] ?? ''} onChange={(e) => set('pix_key', e.target.value)} />
            </div>
            <div className="fld"><label>Moeda</label>
              <select><option>BRL · Real</option></select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GaleriaAdminPage ────────────────────────────────────────────────────────

function GaleriaAdminPage() {
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [photos, setPhotos] = useState<(PhotoRow & { _deleting?: boolean; _reprocessing?: boolean })[]>([]);
  const [folderFilter, setFolderFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (fid = folderFilter) => {
    setLoading(true);
    const url = fid ? `/api/admin/photos?folder_id=${fid}` : '/api/admin/photos';
    adminFetch(url).then((r) => r.json()).then((d) => {
      setPhotos(d.photos ?? []);
      setLoading(false);
    });
  };

  useEffect(() => {
    adminFetch('/api/admin/folders').then((r) => r.json()).then((d) => {
      if (d.folders) setFolders(d.folders);
    });
    load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilter = (fid: string) => {
    setFolderFilter(fid);
    load(fid);
  };

  const togglePublish = async (photo: PhotoRow) => {
    await adminFetch(`/api/admin/photos/${photo.id}`, {
      method: 'PUT',
      body: JSON.stringify({ published: !photo.published }),
    });
    setPhotos((ps) => ps.map((p) => p.id === photo.id ? { ...p, published: !p.published } : p));
  };

  const deletePhoto = async (photo: PhotoRow) => {
    if (!confirm(`Deletar "${photo.title ?? photo.filename}"? Esta ação não pode ser desfeita.`)) return;
    setPhotos((ps) => ps.map((p) => p.id === photo.id ? { ...p, _deleting: true } : p));
    await adminFetch(`/api/admin/photos/${photo.id}`, { method: 'DELETE' });
    setPhotos((ps) => ps.filter((p) => p.id !== photo.id));
  };

  const toggleWatermark = async (photo: PhotoRow) => {
    const next = !photo.has_watermark;
    setPhotos((ps) => ps.map((p) => p.id === photo.id ? { ...p, _reprocessing: true } : p));
    const res = await adminFetch(`/api/admin/photos/${photo.id}/reprocess`, {
      method: 'POST',
      body: JSON.stringify({ has_watermark: next }),
    });
    if (res.ok) {
      setPhotos((ps) => ps.map((p) => p.id === photo.id ? { ...p, has_watermark: next, _reprocessing: false } : p));
    } else {
      const err = await res.json().catch(() => ({ error: 'Erro' }));
      alert('Erro ao reprocessar: ' + (err.error ?? 'desconhecido'));
      setPhotos((ps) => ps.map((p) => p.id === photo.id ? { ...p, _reprocessing: false } : p));
    }
  };

  const updateAspectRatio = async (photo: PhotoRow, aspectRatio: string) => {
    await adminFetch(`/api/admin/photos/${photo.id}`, {
      method: 'PUT',
      body: JSON.stringify({ aspect_ratio: aspectRatio }),
    });
    setPhotos((ps) => ps.map((p) => p.id === photo.id ? { ...p, aspect_ratio: aspectRatio } : p));
  };

  const folderName = (fid: string) => folders.find((f) => f.id === fid)?.name ?? '—';

  return (
    <div className="fade-in">
      <div className="admin-bar">
        <h1><i>Galeria</i> & Mídia</h1>
        <div className="actions">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
            {photos.length} item{photos.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
        <select
          value={folderFilter}
          onChange={(e) => applyFilter(e.target.value)}
          style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', color: 'var(--fg)', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', minWidth: 220 }}
        >
          <option value="">Todas as pastas</option>
          {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 11 }} onClick={() => load(folderFilter)}>↺ Atualizar</button>
      </div>

      {loading ? (
        <div className="loading-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="loading-card" />)}</div>
      ) : photos.length === 0 ? (
        <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>
          Nenhum item encontrado.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {photos.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
                overflow: 'hidden',
                opacity: p._deleting ? 0.4 : p.published ? 1 : 0.6,
                transition: 'opacity .2s',
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg-soft)' }}>
                {p.media_type === 'video' ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--bg-soft)' }}>
                    <span style={{ fontSize: 32, opacity: 0.4 }}>▶</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>vídeo</span>
                  </div>
                ) : (
                  <img
                    src={p.watermarked_url ?? ''}
                    alt={p.title ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                {/* Media type badge */}
                <div style={{ position: 'absolute', top: 6, left: 6, fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', background: p.media_type === 'video' ? 'rgba(0,40,80,0.85)' : 'rgba(0,0,0,0.65)', color: '#fff', padding: '2px 6px' }}>
                  {p.media_type === 'video' ? 'VÍDEO' : 'FOTO'}
                </div>
                {!p.published && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '4px 8px' }}>Oculta</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title ?? p.filename}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--fg-mute)', textTransform: 'uppercase', marginBottom: 6 }}>
                  {folderName(p.folder_id)}{p.price ? ` · R$${p.price}` : ''}
                </div>
                {/* Watermark badge - only for photos */}
                {p.media_type === 'photo' && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '2px 7px', borderRadius: 2,
                      background: p.has_watermark ? 'var(--accent-soft)' : 'var(--bg-soft)',
                      color: p.has_watermark ? 'var(--accent)' : 'var(--fg-faint)',
                      border: '1px solid ' + (p.has_watermark ? 'transparent' : 'var(--line)'),
                    }}>
                      {p.has_watermark ? '© com marca d\'água' : '○ sem marca d\'água'}
                    </span>
                  </div>
                )}
                {/* Aspect ratio badge and selector */}
                <div style={{ marginBottom: 8 }}>
                  <select
                    value={p.aspect_ratio}
                    onChange={(e) => updateAspectRatio(p, e.target.value)}
                    disabled={p._deleting || p._reprocessing}
                    style={{ fontSize: 9, fontFamily: 'var(--font-mono)', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--fg-mute)', padding: '2px 4px', letterSpacing: '0.06em', width: '100%' }}
                  >
                    <option value="auto">Auto</option>
                    <option value="1/1">1:1 — Square</option>
                    <option value="3/4">3:4 — Retrato</option>
                    <option value="4/5">4:5 — Instagram</option>
                    <option value="2/3">2:3 — Clássico</option>
                    <option value="4/3">4:3 — Paisagem</option>
                    <option value="3/2">3:2 — Foto 35mm</option>
                    <option value="16/9">16:9 — Cinemascope</option>
                    <option value="9/16">9:16 — Vertical</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn-ghost"
                    style={{ flex: 1, padding: '4px 6px', fontSize: 10, color: p.published ? 'var(--fg-mute)' : 'var(--accent)' }}
                    onClick={() => togglePublish(p)}
                    disabled={p._reprocessing}
                  >
                    {p.published ? 'Ocultar' : 'Publicar'}
                  </button>
                  {p.media_type === 'photo' && (
                    <button
                      className="btn-ghost"
                      style={{ padding: '4px 6px', fontSize: 10, color: p.has_watermark ? 'var(--fg-mute)' : 'var(--accent)', borderColor: p.has_watermark ? undefined : 'var(--accent)' }}
                      onClick={() => toggleWatermark(p)}
                      disabled={p._reprocessing || p._deleting}
                      title={p.has_watermark ? 'Remover marca d\'água' : 'Adicionar marca d\'água'}
                    >
                      {p._reprocessing ? '…' : p.has_watermark ? '©' : '○'}
                    </button>
                  )}
                  <button
                    className="btn-ghost"
                    style={{ padding: '4px 8px', fontSize: 10, color: 'oklch(0.6 0.18 25)', borderColor: 'oklch(0.75 0.08 25)' }}
                    onClick={() => deletePhoto(p)}
                    disabled={p._deleting || p._reprocessing}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DestaquesPage ────────────────────────────────────────────────────────────

interface FeaturedSlotData {
  slot: number;
  folder_id: string;
  title: string;
  kicker: string;
  tag: string;
}

interface HeroItemLocal {
  photo_id: string;
  order: number;
  img?: string;
  aspect_ratio?: string;
}

function DestaquesPage() {
  const [tab, setTab] = useState<'hero' | 'featured'>('hero');

  // Hero state: list of selected photo IDs (in order)
  const [heroIds, setHeroIds] = useState<string[]>([]);
  const [allPhotos, setAllPhotos] = useState<PhotoRow[]>([]);

  // Featured state: 3 folder slots
  const [featuredSlots, setFeaturedSlots] = useState<FeaturedSlotData[]>([
    { slot: 1, folder_id: '', title: '', kicker: '01 — ', tag: '' },
    { slot: 2, folder_id: '', title: '', kicker: '02 — ', tag: '' },
    { slot: 3, folder_id: '', title: '', kicker: '03 — ', tag: '' },
  ]);
  const [allFolders, setAllFolders] = useState<FolderRow[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/highlights').then((r) => r.json()),
      adminFetch('/api/admin/photos?media_type=photo').then((r) => r.json()),
      adminFetch('/api/admin/folders').then((r) => r.json()),
    ]).then(([highlights, photosData, foldersData]) => {
      // Load hero
      const heroItems = (highlights.hero ?? []).sort((a: HeroItemLocal, b: HeroItemLocal) => a.order - b.order);
      setHeroIds(heroItems.map((h: HeroItemLocal) => h.photo_id));

      // Load featured
      const loaded = highlights.featured ?? [];
      setFeaturedSlots([
        loaded.find((f: FeaturedSlotData) => f.slot === 1) ?? { slot: 1, folder_id: '', title: '', kicker: '01 — ', tag: '' },
        loaded.find((f: FeaturedSlotData) => f.slot === 2) ?? { slot: 2, folder_id: '', title: '', kicker: '02 — ', tag: '' },
        loaded.find((f: FeaturedSlotData) => f.slot === 3) ?? { slot: 3, folder_id: '', title: '', kicker: '03 — ', tag: '' },
      ]);

      setAllPhotos((photosData.photos ?? []).filter((p: PhotoRow) => p.watermarked_url && p.media_type === 'photo'));
      setAllFolders(foldersData.folders ?? []);
      setLoading(false);
    });
  }, []);

  const toggleHeroPhoto = (photoId: string) => {
    setHeroIds((ids) => {
      if (ids.includes(photoId)) return ids.filter((id) => id !== photoId);
      if (ids.length >= 5) return ids; // max 5
      return [...ids, photoId];
    });
  };

  const moveHero = (index: number, dir: -1 | 1) => {
    setHeroIds((ids) => {
      const next = [...ids];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return next;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  };

  const setFeaturedSlot = (slot: number, patch: Partial<FeaturedSlotData>) => {
    setFeaturedSlots((ss) => ss.map((s) => s.slot === slot ? { ...s, ...patch } : s));
  };

  const onFolderSelect = (slot: number, folder: FolderRow) => {
    setFeaturedSlot(slot, {
      folder_id: folder.id,
      title: folder.name,
      kicker: `0${slot} — ${folder.kind === 'sale' ? 'À venda' : 'Portfólio'}`,
      tag: folder.location ?? '',
    });
  };

  const save = async () => {
    setSaving(true);
    const hero = heroIds.map((id, i) => ({ photo_id: id, order: i }));
    const featured = featuredSlots.filter((s) => s.folder_id);
    await adminFetch('/api/highlights', {
      method: 'PUT',
      body: JSON.stringify({ hero, featured }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Carregando...</div>;

  return (
    <div className="fade-in">
      <div className="admin-bar">
        <h1><i>Destaques</i></h1>
        <div className="actions">
          <button className="btn-solid" onClick={save} disabled={saving}>
            {saved ? '✓ Salvo' : saving ? 'Salvando...' : 'Salvar →'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 24 }}>
        {([['hero', 'Hero (Fotos de fundo)'], ['featured', 'Trabalhos em Destaque (Pastas)']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 20px', background: 'transparent', border: 0,
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t ? 'var(--fg)' : 'var(--fg-mute)',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* HERO TAB */}
      {tab === 'hero' && (
        <div>
          <div style={{ marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
            Selecione até 5 fotos para o hero rotativo. Clique para selecionar/remover. Use ↑↓ para ordenar.
          </div>

          {/* Selected hero photos - ordered list */}
          {heroIds.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: 10 }}>
                Ordem do hero ({heroIds.length}/5)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {heroIds.map((id, i) => {
                  const p = allPhotos.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-elev)', border: '1px solid var(--accent)', padding: '6px 10px' }}>
                      <img src={p.watermarked_url!} alt="" style={{ width: 48, height: 32, objectFit: 'cover' }} />
                      <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14 }}>{p.title ?? p.filename}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-faint)' }}>{String(i + 1).padStart(2, '0')}</span>
                      <button className="btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => moveHero(i, -1)} disabled={i === 0}>↑</button>
                      <button className="btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => moveHero(i, 1)} disabled={i === heroIds.length - 1}>↓</button>
                      <button className="btn-ghost" style={{ padding: '2px 8px', fontSize: 11, color: 'oklch(0.6 0.18 25)' }} onClick={() => toggleHeroPhoto(id)}>×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All photos grid */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: 10 }}>
            Todas as fotos — clique para {heroIds.length >= 5 ? '(limite atingido)' : 'selecionar'}
          </div>
          {allPhotos.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              Nenhuma foto disponível. Publique fotos primeiro.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
              {allPhotos.map((p) => {
                const selected = heroIds.includes(p.id);
                const order = heroIds.indexOf(p.id) + 1;
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleHeroPhoto(p.id)}
                    style={{
                      position: 'relative', cursor: heroIds.length >= 5 && !selected ? 'not-allowed' : 'pointer',
                      border: selected ? '2px solid var(--accent)' : '2px solid var(--line)',
                      opacity: heroIds.length >= 5 && !selected ? 0.4 : 1,
                      overflow: 'hidden', transition: 'border-color .15s, opacity .15s',
                    }}
                  >
                    <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                      <img src={p.watermarked_url!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {selected && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, background: 'var(--accent)', color: 'var(--accent-fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>
                        {order}
                      </div>
                    )}
                    <div style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-mute)', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title ?? p.filename}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FEATURED TAB */}
      {tab === 'featured' && (
        <div>
          <div style={{ marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
            Selecione até 3 pastas para aparecerem na seção &quot;Trabalhos em Destaque&quot; da home.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {featuredSlots.map((s) => {
              const folder = allFolders.find((f) => f.id === s.folder_id);
              return (
                <div key={s.slot} style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', overflow: 'hidden' }}>
                  {/* Cover image */}
                  <div style={{ aspectRatio: '16/9', background: 'var(--bg-soft)', position: 'relative', overflow: 'hidden' }}>
                    {folder?.cover_url ? (
                      <img src={folder.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 40, color: 'var(--fg-faint)', lineHeight: 1 }}>0{s.slot}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Sem pasta</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 8, left: 8, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 7px' }}>
                      Destaque 0{s.slot}
                    </div>
                  </div>

                  {/* Fields */}
                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Folder picker */}
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 4 }}>Pasta</div>
                      <select
                        value={s.folder_id}
                        onChange={(e) => {
                          const f = allFolders.find((x) => x.id === e.target.value);
                          if (f) onFolderSelect(s.slot, f);
                          else setFeaturedSlot(s.slot, { folder_id: '' });
                        }}
                        style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--fg)', padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: 12, boxSizing: 'border-box' }}
                      >
                        <option value="">— Nenhuma —</option>
                        {allFolders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 4 }}>Título</div>
                      <input value={s.title} onChange={(e) => setFeaturedSlot(s.slot, { title: e.target.value })} placeholder="Nome do trabalho" style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--fg)', padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 4 }}>Kicker</div>
                      <input value={s.kicker} onChange={(e) => setFeaturedSlot(s.slot, { kicker: e.target.value })} placeholder={`0${s.slot} — Categoria`} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--fg)', padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 4 }}>Tag / Local</div>
                      <input value={s.tag} onChange={(e) => setFeaturedSlot(s.slot, { tag: e.target.value })} placeholder="São Paulo, SP" style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--fg)', padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin shell ──────────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { grp: 'Visão geral', items: [
    { id: 'dashboard', label: 'Painel' },
    { id: 'sales', label: 'Vendas' },
  ]},
  { grp: 'Conteúdo', items: [
    { id: 'upload', label: 'Publicar' },
    { id: 'events', label: 'Eventos & pastas' },
    { id: 'gallery', label: 'Galeria & Mídia' },
    { id: 'highlights', label: 'Destaques' },
  ]},
  { grp: 'Configurações', items: [
    { id: 'settings', label: 'Configurações' },
  ]},
];

type AdminPage = 'dashboard' | 'sales' | 'upload' | 'events' | 'gallery' | 'highlights' | 'settings';

interface AdminProps {
  onNavigate: (to: Screen) => void;
  onLogout: () => void;
  userEmail?: string;
}

export function Admin({ onNavigate, onLogout, userEmail }: AdminProps) {
  const [page, setPage] = useState<AdminPage>('dashboard');

  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut();
    onLogout();
    onNavigate('home');
  };

  const hide = (p: AdminPage) => ({ display: page === p ? undefined : 'none' } as React.CSSProperties);

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-brand">Aleen<i>.</i>Code <small>admin</small></div>
        <nav className="admin-nav">
          {ADMIN_NAV.map((g) => (
            <div key={g.grp}>
              <div className="grp">{g.grp}</div>
              {g.items.map((it) => (
                <button key={it.id} data-active={(page === it.id).toString()} onClick={() => setPage(it.id as AdminPage)}>
                  <span style={{ width: 14, color: 'var(--accent)' }}>›</span>
                  {it.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-user">
          <div className="avatar">A</div>
          <div className="who">
            Aleen
            <small>{userEmail ?? 'admin'}</small>
          </div>
          <button
            onClick={handleLogout}
            style={{ marginLeft: 'auto', background: 'transparent', border: 0, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div style={hide('dashboard')}><Dashboard onSetPage={setPage} /></div>
        <div style={hide('upload')}><UploadPage /></div>
        <div style={hide('events')}><EventsPage /></div>
        <div style={hide('gallery')}><GaleriaAdminPage /></div>
        <div style={hide('highlights')}><DestaquesPage /></div>
        <div style={hide('sales')}><SalesPage /></div>
        <div style={hide('settings')}><SettingsPage /></div>
      </main>
    </div>
  );
}
