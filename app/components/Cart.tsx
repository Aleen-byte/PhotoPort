'use client';

import { useState } from 'react';
import type { CartItem } from './data';
import type { Screen } from './Header';

interface CartDrawerProps {
  open: boolean;
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, cart, onClose, onRemove, onCheckout }: CartDrawerProps) {
  if (!open) return null;
  const subtotal = cart.reduce((s, c) => s + c.price, 0);
  const fee = cart.length > 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + fee;

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <aside className="cart-drawer">
        <header className="cart-hd">
          <h3>Carrinho<i style={{ fontStyle: 'italic', color: 'var(--accent)' }}>.</i></h3>
          <button className="x" onClick={onClose}>×</button>
        </header>
        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              Seu carrinho está vazio.<br /><br />
              <span style={{ color: 'var(--fg-soft)' }}>Explore uma galeria à venda para adicionar fotos.</span>
            </div>
          ) : (
            cart.map((c) => (
              <div key={c.id} className="cart-item">
                <img src={c.img} alt={c.title} />
                <div className="info">
                  <span className="t">{c.title}</span>
                  <span className="s">{c.eventTitle}</span>
                  <button className="rm" onClick={() => onRemove(c.id)}>Remover</button>
                </div>
                <span className="price">R$ {c.price}</span>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <footer className="cart-ft">
            <div className="line"><span>Subtotal</span><span>R$ {subtotal}</span></div>
            <div className="line"><span>Taxa de processamento</span><span>R$ {fee}</span></div>
            <div className="line total"><span>Total</span><span>R$ {total}</span></div>
            <button className="checkout" onClick={onCheckout}>Finalizar compra →</button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em', textAlign: 'center' }}>
              Download em alta resolução após pagamento.
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}

interface CheckoutProps {
  cart: CartItem[];
  onNavigate: (to: Screen) => void;
  onComplete: () => void;
}

export function Checkout({ cart, onNavigate, onComplete }: CheckoutProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [pay, setPay] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [form, setForm] = useState({ name: '', email: '', cpf: '' });
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  const subtotal = cart.reduce((s, c) => s + c.price, 0);
  const fee = cart.length > 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + fee;

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="fade-in" style={{ padding: 96, textAlign: 'center' }}>
        <p style={{ color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>Carrinho vazio.</p>
        <button className="btn-solid" style={{ marginTop: 16 }} onClick={() => onNavigate('events')}>Ver galerias</button>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!form.email) { setError('E-mail obrigatório.'); return; }
    setError('');
    setStep('processing');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          payment_method: pay,
          items: cart.map((c) => ({ photo_id: c.id, folder_id: c.eventId, price: c.price })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erro desconhecido');
      setOrderNumber(json.orderNumber);
      setStep('success');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao processar pedido.');
      setStep('form');
    }
  };

  if (step === 'success') {
    return (
      <div className="co-success fade-in">
        <div className="check">✓</div>
        <h1>Compra <i>confirmada</i></h1>
        <p>Suas {cart.length} {cart.length === 1 ? 'foto está pronta' : 'fotos estão prontas'} para download em alta resolução. Enviamos também um e-mail com o link permanente.</p>
        <div className="order-no">Pedido {orderNumber}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn-ghost" onClick={() => { onComplete(); onNavigate('home'); }}>Voltar ao início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout fade-in">
      <div className="co-form">
        <div className="co-step">Etapa 01 — Seus dados</div>
        <h1 className="co-h">Quase <i>lá</i>.</h1>

        <div className="co-grid2">
          <div className="co-fld">
            <label>Nome completo</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mariana Souza" />
          </div>
          <div className="co-fld">
            <label>CPF</label>
            <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
          </div>
        </div>
        <div className="co-fld">
          <label>E-mail (entrega do download)</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="você@email.com" type="email" required />
        </div>

        <div className="co-step" style={{ marginTop: 32 }}>Etapa 02 — Pagamento</div>
        <div className="co-pay">
          {([
            { id: 'pix', label: 'PIX', sub: 'instantâneo' },
            { id: 'card', label: 'Cartão', sub: 'até 6x' },
            { id: 'boleto', label: 'Boleto', sub: 'compensa em 1 dia útil' },
          ] as const).map((p) => (
            <button key={p.id} data-active={(pay === p.id).toString()} onClick={() => setPay(p.id)}>
              <strong>{p.label}</strong>
              <span>{p.sub}</span>
            </button>
          ))}
        </div>

        {pay === 'card' && (
          <>
            <div className="co-fld">
              <label>Número do cartão</label>
              <input placeholder="•••• •••• •••• ••••" />
            </div>
            <div className="co-grid2">
              <div className="co-fld"><label>Validade</label><input placeholder="MM/AA" /></div>
              <div className="co-fld"><label>CVV</label><input placeholder="•••" /></div>
            </div>
          </>
        )}

        {pay === 'pix' && (
          <div style={{ background: 'var(--bg-soft)', padding: 20, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 80, height: 80, background: '#fff', position: 'relative', flexShrink: 0 }}>
              <svg viewBox="0 0 8 8" style={{ width: '100%', height: '100%' }}>
                {Array.from({ length: 64 }).map((_, i) => {
                  const x = i % 8, y = Math.floor(i / 8);
                  const on = ((x * 13 + y * 7 + (x ^ y) * 3) % 5) < 2 || (x < 2 && y < 2) || (x > 5 && y < 2) || (x < 2 && y > 5);
                  return on ? <rect key={i} x={x} y={y} width="1" height="1" fill="#000" /> : null;
                })}
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>Escaneie para pagar</div>
              <div style={{ color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', marginTop: 4 }}>
                Liberação imediata após confirmação.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: '10px 14px', background: 'oklch(0.95 0.04 25)', color: 'oklch(0.45 0.18 25)', fontFamily: 'var(--font-mono)', fontSize: 12, border: '1px solid oklch(0.85 0.08 25)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
          <button className="btn-ghost" onClick={() => onNavigate('events')}>← Cancelar</button>
          <button
            className="btn-solid"
            style={{ marginLeft: 'auto', padding: '14px 28px' }}
            onClick={handleConfirm}
            disabled={step === 'processing'}
          >
            {step === 'processing' ? 'Processando...' : `Confirmar pedido · R$ ${total}`}
          </button>
        </div>
      </div>

      <aside className="co-summary">
        <div className="co-step">Resumo</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, letterSpacing: '-0.01em', margin: '0 0 24px' }}>
          {cart.length} {cart.length === 1 ? 'imagem' : 'imagens'}
        </h2>
        <div className="co-sum-items">
          {cart.map((c) => (
            <div className="co-sum-item" key={c.id}>
              <img src={c.img} alt={c.title} />
              <div>
                <div className="t">{c.title}</div>
                <div className="s">{c.eventTitle}</div>
              </div>
              <div className="p">R$ {c.price}</div>
            </div>
          ))}
        </div>
        <div className="co-sum-row"><span>Subtotal</span><span>R$ {subtotal}</span></div>
        <div className="co-sum-row"><span>Taxa</span><span>R$ {fee}</span></div>
        <div className="co-sum-row tot"><span>Total</span><span>R$ {total}</span></div>

        <div style={{ marginTop: 32, padding: 16, background: 'var(--bg-elev)', border: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 8 }}>O que você recebe</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13, color: 'var(--fg-soft)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>↳ Arquivos JPEG em alta resolução</li>
            <li>↳ Sem marca d'água</li>
            <li>↳ Direito de uso pessoal vitalício</li>
            <li>↳ Link de download por 12 meses</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
