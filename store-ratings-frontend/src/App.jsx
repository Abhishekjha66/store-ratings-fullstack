import React, { useEffect, useMemo, useState } from 'react';
import { api, apiBase } from './api';

const moneylessDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const initials = (value = '') => value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
const average = (items = []) => items.length ? (items.reduce((sum, item) => sum + Number(item.score || 0), 0) / items.length).toFixed(1) : '—';

function readSession() {
  try { return JSON.parse(localStorage.getItem('store-ratings-session') || 'null'); }
  catch { return null; }
}

function App() {
  const [session, setSession] = useState(readSession);
  const [page, setPage] = useState('overview');
  const [toast, setToast] = useState(null);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    if (session) localStorage.setItem('store-ratings-session', JSON.stringify(session));
    else localStorage.removeItem('store-ratings-session');
  }, [session]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (message, type = 'success') => setToast({ message, type });
  const logout = () => { setSession(null); setPage('overview'); notify('You have been signed out.'); };

  if (!session) {
    return <AuthScreen mode={authMode} setMode={setAuthMode} onAuthenticated={(next) => { setSession(next); setPage('overview'); }} notify={notify} />;
  }

  const role = session.user?.role;
  const nav = role === 'ADMIN'
    ? [{ id: 'overview', label: 'Overview', icon: '▦' }, { id: 'users', label: 'Users', icon: '♙' }, { id: 'stores', label: 'Stores', icon: '⌂' }, { id: 'ratings', label: 'Ratings', icon: '★' }]
    : role === 'STORE_OWNER'
      ? [{ id: 'overview', label: 'Overview', icon: '▦' }, { id: 'my-stores', label: 'My stores', icon: '⌂' }]
      : [{ id: 'overview', label: 'Discover stores', icon: '⌕' }];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>store<span className="brand-light">ratings</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="side-nav">
          {nav.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}
        </div>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon">✦</div><strong>Need a hand?</strong><p>Explore stores and manage ratings in one place.</p></div>
          <div className="profile-mini"><div className="avatar">{initials(session.user?.name || session.user?.email)}</div><div className="profile-copy"><strong>{session.user?.name || session.user?.email}</strong><span>{roleLabel(role)}</span></div><button className="icon-button logout-icon" title="Sign out" onClick={logout}>↗</button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{nav.find((item) => item.id === page)?.label || pageTitle(page)}</strong></div><div className="topbar-right"><span className="api-status"><i /> API configured</span><div className="avatar small">{initials(session.user?.name || session.user?.email)}</div></div></header>
        <div className="content-wrap">
          {role === 'ADMIN' && page === 'overview' && <AdminOverview session={session} setPage={setPage} notify={notify} />}
          {role === 'ADMIN' && page === 'users' && <AdminUsers session={session} notify={notify} />}
          {role === 'ADMIN' && page === 'stores' && <AdminStores session={session} notify={notify} />}
          {role === 'ADMIN' && page === 'ratings' && <AdminRatings session={session} notify={notify} />}
          {role === 'USER' && page === 'overview' && <UserStores session={session} notify={notify} />}
          {role === 'STORE_OWNER' && (page === 'overview' || page === 'my-stores') && <OwnerDashboard session={session} notify={notify} />}
          {!nav.some((item) => item.id === page) && <div className="panel empty-state"><div className="empty-icon">⌁</div><h2>Page unavailable</h2><p>This page is not available for your account role.</p><button className="btn primary" onClick={() => setPage(nav[0]?.id || 'overview')}>Go to dashboard</button></div>}
        </div>
        <footer className="footer">© {new Date().getFullYear()} Store Ratings <span>•</span> Connected to {apiBase}</footer>
      </main>
      {toast && <div className={`toast ${toast.type}`} role="status"><span>{toast.type === 'error' ? '!' : '✓'}</span>{toast.message}<button onClick={() => setToast(null)}>×</button></div>}
    </div>
  );
}

function roleLabel(role) { return role === 'STORE_OWNER' ? 'Store owner' : role === 'ADMIN' ? 'Administrator' : 'Customer'; }
function pageTitle(page) { return ({ 'my-stores': 'My stores' })[page] || page; }

function AuthScreen({ mode, setMode, onAuthenticated, notify }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'signup') {
        await api('/auth/signup', { method: 'POST', body: { name: form.name.trim(), email: form.email.trim(), address: form.address.trim() || undefined, password: form.password } });
        notify('Account created. Sign in with your new credentials.');
        setMode('login');
      } else {
        const result = await api('/auth/login', { method: 'POST', body: { email: form.email.trim(), password: form.password } });
        if (!result?.token || !result?.user) throw new Error('The login response did not contain a token and user profile.');
        onAuthenticated({ token: result.token, user: result.user });
      }
    } catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  return <div className="auth-page">
    <div className="auth-visual"><div className="auth-brand"><span className="brand-mark">S</span> store<span>ratings</span></div><div className="visual-copy"><div className="eyebrow light">A BETTER WAY TO CHOOSE</div><h1>Good stores.<br /><em>Honest ratings.</em></h1><p>Discover trusted places, share your experience, and help your community shop with confidence.</p><div className="visual-stats"><div><strong>01</strong><span>Discover</span></div><div><strong>02</strong><span>Rate</span></div><div><strong>03</strong><span>Decide</span></div></div></div><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-foot">STORE RATINGS PLATFORM <span>•</span> BUILT FOR TRUST</div></div>
    <div className="auth-panel"><div className="auth-form-wrap"><div className="mobile-brand"><span className="brand-mark">S</span> storeratings</div><div className="eyebrow">WELCOME {mode === 'login' ? 'BACK' : 'ABOARD'}</div><h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2><p className="auth-subtitle">{mode === 'login' ? 'Enter your details to continue to your workspace.' : 'Create a customer account to start rating stores.'}</p>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <><label>Full name<input value={form.name} onChange={update('name')} placeholder="Your full name" minLength="2" maxLength="60" required /></label><label>Address <span className="optional">(optional)</span><input value={form.address} onChange={update('address')} placeholder="City, area or address" maxLength="400" /></label></>}
        <label>Email address<input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" required /></label>
        <label>Password<input type="password" value={form.password} onChange={update('password')} placeholder={mode === 'signup' ? '8–16 characters' : 'Enter your password'} minLength={mode === 'signup' ? 8 : undefined} maxLength={mode === 'signup' ? 16 : undefined} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></label>
        {mode === 'signup' && <p className="field-hint">8–16 characters, including at least one uppercase letter and one special character.</p>}
        {error && <div className="inline-error">{error}</div>}
        <button className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button>
      </form>
      <div className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already registered?'} <button onClick={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login'); }}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></div>
      <div className="auth-note"><span>⌑</span> Your account access is based on its assigned role.</div>
    </div></div>
  </div>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function StatCard({ label, value, detail, icon, tone = 'blue' }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>;
}
function Loading({ label = 'Loading your data…' }) { return <div className="loading"><span className="spinner" />{label}</div>; }
function ErrorPanel({ error, retry }) { return <div className="error-panel"><div className="error-symbol">!</div><div><strong>We couldn't load this information</strong><p>{error}</p>{retry && <button className="text-button" onClick={retry}>Try again →</button>}</div></div>; }
function Empty({ icon = '⌂', title, text }) { return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>; }
function PanelTitle({ title, subtitle, action }) { return <div className="panel-title"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>; }

function AdminOverview({ session, setPage, notify }) {
  const [data, setData] = useState({ users: [], stores: [], ratings: [] });
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const [users, stores, ratings] = await Promise.all([api('/users', { token: session.token }), api('/stores'), api('/ratings')]); setData({ users: Array.isArray(users) ? users : [], stores: Array.isArray(stores) ? stores : [], ratings: Array.isArray(ratings) ? ratings : [] }); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const avg = average(data.ratings);
  return <>
    <PageHeading eyebrow="ADMINISTRATION" title="Good morning, Admin" description="Here's what's happening across your store ratings platform." action={<button className="btn secondary" onClick={load}>↻ <span>Refresh data</span></button>} />
    {error && <ErrorPanel error={error} retry={load} />}
    {loading ? <Loading /> : <>
      <div className="stats-grid"><StatCard label="Total users" value={data.users.length} detail="Registered accounts" icon="♙" tone="blue"/><StatCard label="Total stores" value={data.stores.length} detail="Listed on the platform" icon="⌂" tone="violet"/><StatCard label="Ratings submitted" value={data.ratings.length} detail="Community feedback" icon="★" tone="amber"/><StatCard label="Average rating" value={avg === '—' ? '—' : `${avg}/5`} detail="Across all submitted ratings" icon="↗" tone="green"/></div>
      <div className="dashboard-grid"><section className="panel"><PanelTitle title="Recently registered users" subtitle="Latest accounts on your platform" action={<button className="text-button" onClick={() => setPage('users')}>View all →</button>}/>{data.users.length ? <div className="table-wrap"><table><thead><tr><th>USER</th><th>ROLE</th><th>JOINED</th></tr></thead><tbody>{data.users.slice(0, 5).map((user) => <tr key={user.id}><td><div className="person-cell"><div className="avatar">{initials(user.name)}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td><td><RolePill role={user.role}/></td><td>{moneylessDate(user.createdAt)}</td></tr>)}</tbody></table></div> : <Empty title="No users yet" text="Registered users will appear here."/>}</section>
      <section className="panel quick-panel"><PanelTitle title="Quick actions" subtitle="Common admin tasks"/><button className="quick-action" onClick={() => setPage('stores')}><span className="quick-icon violet">＋</span><span><strong>Add a store</strong><small>Create a new store listing</small></span><b>→</b></button><button className="quick-action" onClick={() => setPage('users')}><span className="quick-icon blue">♙</span><span><strong>Manage users</strong><small>Review registered accounts</small></span><b>→</b></button><button className="quick-action" onClick={() => setPage('ratings')}><span className="quick-icon amber">★</span><span><strong>Review ratings</strong><small>See community feedback</small></span><b>→</b></button><div className="tip-box"><span>✦</span><p><strong>Platform tip</strong><br/>Keep store details accurate so customers can find the right place.</p></div></section></div>
      <section className="panel store-preview"><PanelTitle title="Store directory" subtitle="A snapshot of stores listed on the platform" action={<button className="text-button" onClick={() => setPage('stores')}>Manage stores →</button>}/><StoreTable stores={data.stores.slice(0, 5)} /></section>
    </>}
  </>;
}
function RolePill({ role }) { return <span className={`role-pill ${String(role || '').toLowerCase()}`}>{roleLabel(role)}</span>; }

function AdminUsers({ session, notify }) {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [search, setSearch] = useState(''); const [deleting, setDeleting] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const result = await api('/users', { token: session.token }); setUsers(Array.isArray(result) ? result : []); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const filtered = users.filter((user) => `${user.name} ${user.email} ${user.address || ''} ${user.role}`.toLowerCase().includes(search.toLowerCase()));
  async function remove(user) { if (!window.confirm(`Delete ${user.name}? This action cannot be undone.`)) return; setDeleting(user.id); try { await api(`/users/${encodeURIComponent(user.id)}`, { method: 'DELETE', token: session.token }); notify('User deleted successfully.'); await load(); } catch (err) { notify(err.message, 'error'); } finally { setDeleting(''); } }
  return <><PageHeading eyebrow="PEOPLE" title="User management" description="View and manage accounts registered on your platform." action={<button className="btn secondary" onClick={load}>↻ Refresh</button>}/><section className="panel"><PanelTitle title={`${users.length} registered users`} subtitle="User accounts and assigned roles"/><div className="toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or address…"/></div><span className="result-count">{filtered.length} results</span></div>{error ? <ErrorPanel error={error} retry={load}/> : loading ? <Loading/> : filtered.length ? <div className="table-wrap"><table><thead><tr><th>USER</th><th>ADDRESS</th><th>ROLE</th><th>JOINED</th><th className="align-right">ACTION</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><div className="person-cell"><div className="avatar">{initials(user.name)}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td><td>{user.address || '—'}</td><td><RolePill role={user.role}/></td><td>{moneylessDate(user.createdAt)}</td><td className="align-right"><button className="table-action danger" disabled={deleting === user.id || user.id === session.user.id} title={user.id === session.user.id ? 'You cannot delete your signed-in account' : 'Delete user'} onClick={() => remove(user)}>{deleting === user.id ? 'Deleting…' : 'Delete'}</button></td></tr>)}</tbody></table></div> : <Empty title="No matching users" text="Try a different search term."/>}</section></>;
}

function AdminStores({ session, notify }) {
  const [stores, setStores] = useState([]); const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [search, setSearch] = useState(''); const [showForm, setShowForm] = useState(false); const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const load = async () => { setLoading(true); setError(''); try { const [storeResult, userResult] = await Promise.all([api('/stores'), api('/users', { token: session.token })]); setStores(Array.isArray(storeResult) ? storeResult : []); setUsers(Array.isArray(userResult) ? userResult : []); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const filtered = stores.filter((store) => `${store.name} ${store.email || ''} ${store.address || ''}`.toLowerCase().includes(search.toLowerCase()));
  async function createStore(event) { event.preventDefault(); setBusy(true); try { await api('/stores', { method: 'POST', body: { name: form.name.trim(), email: form.email.trim() || undefined, address: form.address.trim() || undefined, ownerId: form.ownerId || undefined } }); notify('Store created successfully.'); setForm({ name: '', email: '', address: '', ownerId: '' }); setShowForm(false); await load(); } catch (err) { notify(err.message, 'error'); } finally { setBusy(false); } }
  return <><PageHeading eyebrow="DIRECTORY" title="Store management" description="Create store listings and connect them with store owner accounts." action={<button className="btn primary" onClick={() => setShowForm((v) => !v)}><span>＋</span> Add store</button>}/>
    {showForm && <section className="panel form-panel"><PanelTitle title="Add a new store" subtitle="Store name is required. Other details are optional." action={<button className="icon-button" onClick={() => setShowForm(false)}>×</button>}/><form className="store-form" onSubmit={createStore}><label>Store name<input required maxLength="120" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. The Daily Market"/></label><label>Store email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="store@example.com"/></label><label>Address<input maxLength="400" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Store address"/></label><label>Assign store owner <span className="optional">(optional)</span><select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}><option value="">No owner assigned</option>{users.filter((user) => user.role === 'STORE_OWNER').map((user) => <option value={user.id} key={user.id}>{user.name} — {user.email}</option>)}</select></label><div className="form-actions"><button type="button" className="btn secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Creating…' : 'Create store'}</button></div></form></section>}
    <section className="panel"><PanelTitle title="All stores" subtitle={`${stores.length} stores in your directory`}/><div className="toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stores…"/></div><span className="result-count">{filtered.length} results</span></div>{error ? <ErrorPanel error={error} retry={load}/> : loading ? <Loading/> : <StoreTable stores={filtered}/>}</section>
  </>;
}
function StoreTable({ stores }) { return stores.length ? <div className="table-wrap"><table><thead><tr><th>STORE</th><th>EMAIL</th><th>ADDRESS</th><th>RATING</th></tr></thead><tbody>{stores.map((store) => <tr key={store.id}><td><div className="store-cell"><div className="store-avatar">⌂</div><strong>{store.name}</strong></div></td><td>{store.email || '—'}</td><td>{store.address || '—'}</td><td><span className="rating-value">★ {Number(store.averageRating || 0) ? Number(store.averageRating).toFixed(1) : '—'}</span></td></tr>)}</tbody></table></div> : <Empty title="No stores yet" text="Add your first store to populate the directory."/>; }

function AdminRatings({ session }) {
  const [ratings, setRatings] = useState([]); const [stores, setStores] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [search, setSearch] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const [ratingResult, storeResult] = await Promise.all([api('/ratings'), api('/stores')]); setRatings(Array.isArray(ratingResult) ? ratingResult : []); setStores(Array.isArray(storeResult) ? storeResult : []); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const storeMap = useMemo(() => Object.fromEntries(stores.map((store) => [store.id, store])), [stores]);
  const filtered = ratings.filter((rating) => `${storeMap[rating.storeId]?.name || ''} ${rating.userId} ${rating.score}`.toLowerCase().includes(search.toLowerCase()));
  return <><PageHeading eyebrow="FEEDBACK" title="Ratings overview" description="Monitor the ratings customers have submitted across all stores." action={<button className="btn secondary" onClick={load}>↻ Refresh</button>}/><div className="stats-grid compact-stats"><StatCard label="Total ratings" value={ratings.length} detail="All submitted ratings" icon="★" tone="amber"/><StatCard label="Average score" value={average(ratings) === '—' ? '—' : `${average(ratings)} / 5`} detail="Across all stores" icon="↗" tone="green"/><StatCard label="Rated stores" value={new Set(ratings.map((rating) => rating.storeId)).size} detail="Stores with feedback" icon="⌂" tone="violet"/></div><section className="panel"><PanelTitle title="All customer ratings" subtitle="Rating records returned by your backend"/><div className="toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by store, user ID or score…"/></div><span className="result-count">{filtered.length} results</span></div>{error ? <ErrorPanel error={error} retry={load}/> : loading ? <Loading/> : filtered.length ? <div className="table-wrap"><table><thead><tr><th>STORE</th><th>USER ID</th><th>SCORE</th><th>SUBMITTED</th></tr></thead><tbody>{filtered.map((rating) => <tr key={rating.id}><td><strong>{storeMap[rating.storeId]?.name || rating.storeId}</strong></td><td className="mono">{rating.userId}</td><td><span className="rating-value">★ {rating.score}/5</span></td><td>{moneylessDate(rating.createdAt)}</td></tr>)}</tbody></table></div> : <Empty icon="★" title="No ratings found" text="Ratings will appear here when customers submit feedback."/>}</section><p className="footnote">The current API returns user IDs rather than customer names, so this page displays the IDs provided by the backend.</p></>;
}

function UserStores({ session, notify }) {
  const [stores, setStores] = useState([]); const [myRatings, setMyRatings] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [search, setSearch] = useState(''); const [selected, setSelected] = useState(null); const [score, setScore] = useState(5); const [saving, setSaving] = useState(false);
  const load = async () => { setLoading(true); setError(''); try { const [storeResult, ratingResult] = await Promise.all([api('/stores'), api('/ratings')]); setStores(Array.isArray(storeResult) ? storeResult : []); setMyRatings(Array.isArray(ratingResult) ? ratingResult.filter((rating) => rating.userId === session.user.id) : []); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const filtered = stores.filter((store) => `${store.name} ${store.address || ''} ${store.email || ''}`.toLowerCase().includes(search.toLowerCase()));
  function existingRating(storeId) { return myRatings.find((rating) => rating.storeId === storeId); }
  async function submitRating(event) { event.preventDefault(); if (!selected) return; setSaving(true); try { await api('/ratings', { method: 'POST', body: { storeId: selected.id, userId: session.user.id, score: Number(score) } }); notify(existingRating(selected.id) ? 'Your rating has been updated.' : 'Thanks! Your rating has been submitted.'); setSelected(null); await load(); } catch (err) { notify(err.message, 'error'); } finally { setSaving(false); } }
  return <><PageHeading eyebrow="STORE DISCOVERY" title="Find your next favourite" description="Explore local stores, see what others think, and leave your own rating." action={<button className="btn secondary" onClick={load}>↻ Refresh</button>}/><div className="user-summary"><div><span className="summary-icon">✦</span><div><strong>Your voice matters</strong><p>Rate a store from 1 to 5 stars. You can update your rating at any time.</p></div></div><div className="summary-count"><strong>{myRatings.length}</strong><span>your ratings</span></div></div><div className="toolbar store-toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by store name or location…"/></div><span className="result-count">{filtered.length} stores</span></div>{error ? <ErrorPanel error={error} retry={load}/> : loading ? <Loading/> : filtered.length ? <div className="store-grid">{filtered.map((store) => { const mine = existingRating(store.id); return <article className="store-card" key={store.id}><div className="store-card-top"><div className="store-avatar large">⌂</div><span className="store-rating"><span>★</span> {Number(store.averageRating || 0) ? Number(store.averageRating).toFixed(1) : 'New'}</span></div><h3>{store.name}</h3><p className="store-address">⌖ {store.address || 'Address not provided'}</p><div className="store-card-bottom"><span>{mine ? <><b className="your-score">Your rating: {mine.score}/5</b></> : 'Not rated yet'}</span><button className="btn small-btn primary" onClick={() => { setSelected(store); setScore(mine?.score || 5); }}>{mine ? 'Edit rating' : 'Rate store'} <span>→</span></button></div></article>; })}</div> : <section className="panel"><Empty title="No stores found" text="There are no stores matching your search yet."/></section>}
    {selected && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}><form className="rating-modal" onSubmit={submitRating}><button type="button" className="modal-close" onClick={() => setSelected(null)}>×</button><div className="eyebrow">YOUR EXPERIENCE</div><h2>Rate {selected.name}</h2><p>How was your experience at this store?</p><div className="star-picker" role="radiogroup" aria-label="Rating from 1 to 5">{[1,2,3,4,5].map((value) => <button type="button" key={value} className={value <= score ? 'chosen' : ''} onClick={() => setScore(value)} aria-label={`${value} stars`}>★</button>)}</div><div className="score-caption">{['','Poor','Fair','Good','Very good','Excellent'][score]}</div><div className="modal-actions"><button type="button" className="btn secondary" onClick={() => setSelected(null)}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Submit rating'}</button></div></form></div>}
  </>;
}

function OwnerDashboard({ session }) {
  const [stores, setStores] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const list = await api('/stores'); const details = await Promise.all((Array.isArray(list) ? list : []).map((store) => api(`/stores/${encodeURIComponent(store.id)}`))); setStores(details.filter((store) => store && store.ownerId === session.user.id)); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const allRatings = stores.flatMap((store) => store.ratings || []);
  return <><PageHeading eyebrow="STORE OWNER" title="Your store performance" description="A clear view of the stores assigned to your owner account." action={<button className="btn secondary" onClick={load}>↻ Refresh</button>}/>{error && <ErrorPanel error={error} retry={load}/ >}{loading ? <Loading/> : <><div className="stats-grid"><StatCard label="Your stores" value={stores.length} detail="Stores assigned to you" icon="⌂" tone="violet"/><StatCard label="Total ratings" value={allRatings.length} detail="Customer feedback received" icon="★" tone="amber"/><StatCard label="Average rating" value={average(allRatings) === '—' ? '—' : `${average(allRatings)} / 5`} detail="Across your stores" icon="↗" tone="green"/></div>{stores.length ? <div className="owner-store-list">{stores.map((store) => <section className="panel owner-store" key={store.id}><div className="owner-store-head"><div className="store-avatar large">⌂</div><div className="owner-store-name"><h3>{store.name}</h3><p>{store.address || 'Address not provided'}</p></div><div className="owner-score"><strong>★ {Number(store.averageRating || 0) ? Number(store.averageRating).toFixed(1) : '—'}</strong><span>{(store.ratings || []).length} ratings</span></div></div><div className="rating-breakdown">{[5,4,3,2,1].map((star) => { const count = (store.ratings || []).filter((rating) => rating.score === star).length; const pct = store.ratings?.length ? count / store.ratings.length * 100 : 0; return <div className="breakdown-row" key={star}><span>{star} ★</span><div className="progress-track"><i style={{ width: `${pct}%` }}/></div><small>{count}</small></div>; })}</div></section>)}</div> : <section className="panel"><Empty icon="⌂" title="No stores assigned yet" text="Your account does not currently own any stores. Ask an administrator to assign a store to your account."/></section>}<p className="footnote">Store ownership is matched using the owner ID returned by the existing store details endpoint.</p></>}</>;
}

export default App;
