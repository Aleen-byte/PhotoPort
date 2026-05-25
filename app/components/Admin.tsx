'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { FolderRow, OrderRow } from '@/lib/supabase/types';
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
    const newItems: UploadItem[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      pct: 0,
      done: false,
      previewUrl: URL.createObjectURL(f),
    }));
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

    for (const item of queue.filter((q) => !q.done && !q.error)) {
      const fd = new FormData();
      fd.append('file', item.file);
      fd.append('folder_id', folderId);
      fd.append('price', kind === 'sale' ? String(price) : '');

      setQueue((q) => q.map((x) => x.id === item.id ? { ...x, pct: 20 } : x));

      const token = await getToken();
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        setQueue((q) => q.map((x) => x.id === item.id ? { ...x, pct: 100, done: true } : x));
      } else {
        const err = await res.json();
        setQueue((q) => q.map((x) => x.id === item.id ? { ...x, error: err.error ?? 'Erro', pct: 0 } : x));
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
        accept="image/*"
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
        <p>JPG · PNG · WEBP · até 500 MB por arquivo</p>
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
          <div className="upload-queue">
            {queue.map((q) => (
              <div key={q.id} className="upq" data-done={q.done.toString()}>
                <img src={q.previewUrl} alt="" />
                <div className="meta">
                  <span>{q.file.name}</span>
                  <span className="pct">
                    {q.error ? '✗' : q.done ? '✓' : q.pct > 0 ? Math.round(q.pct) + '%' : ''}
                  </span>
                </div>
                <div className="bar"><i style={{ width: q.pct + '%' }} /></div>
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
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            <option value="__new">＋ Criar nova pasta…</option>
          </select>
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.6)' }}>
      <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line-strong)', padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
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

// ─── Admin shell ──────────────────────────────────────────────────────────────

const ADMIN_NAV = [
  { grp: 'Visão geral', items: [
    { id: 'dashboard', label: 'Painel' },
    { id: 'sales', label: 'Vendas' },
  ]},
  { grp: 'Conteúdo', items: [
    { id: 'upload', label: 'Publicar' },
    { id: 'events', label: 'Eventos & pastas' },
  ]},
  { grp: 'Configurações', items: [
    { id: 'settings', label: 'Configurações' },
  ]},
];

type AdminPage = 'dashboard' | 'sales' | 'upload' | 'events' | 'settings';

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

  let body;
  switch (page) {
    case 'upload': body = <UploadPage />; break;
    case 'events': body = <EventsPage />; break;
    case 'sales': body = <SalesPage />; break;
    case 'settings': body = <SettingsPage />; break;
    default: body = <Dashboard onSetPage={setPage} />;
  }

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
      <main className="admin-main">{body}</main>
    </div>
  );
}
