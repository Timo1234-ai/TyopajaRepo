import { useState, useEffect, useCallback } from 'react';
import './App.css';

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  network: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  search: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  close: 'M18 6L6 18M6 6l12 12',
  router: 'M5 12H3m18 0h-2M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  switch: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  ap: 'M8.111 16.404a5.5 5.5 0 0 1 7.778 0M12 20h.01m-3.889-7.596a8.5 8.5 0 0 1 7.778 0M4.222 9.808a12.5 12.5 0 0 1 15.556 0M1.392 6.7C5.388 2.954 10.695 1 12 1s6.612 1.954 10.608 5.7',
  box: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_LABELS = { switch: 'Switch', access_point: 'Access Point', router: 'Router' };
const TYPE_ICONS  = { switch: icons.switch, access_point: icons.ap, router: icons.router };
const STATUS_LABELS = { active: 'Active', maintenance: 'Maintenance', inactive: 'Inactive' };

const API = '/api/devices';

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, add };
}

// ── AddEditModal ─────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', type: 'switch', brand: '', model: '', serial_number: '', quantity: 1, location: '', status: 'active' };

function DeviceModal({ device, onClose, onSave }) {
  const [form, setForm] = useState(device ? { ...device } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name = 'Name is required';
    if (!form.serial_number.trim()) e.serial_number = 'Serial number is required';
    if (form.quantity < 0)          e.quantity = 'Must be ≥ 0';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) };
      const saved = device
        ? await apiFetch(`${API}/${device.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await apiFetch(API, { method: 'POST', body: JSON.stringify(payload) });
      onSave(saved, !device);
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{device ? 'Edit Device' : 'Add New Device'}</span>
          <button className="btn-icon" onClick={onClose}><Icon d={icons.close} /></button>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Device Name *</label>
              <input className={`form-input${errors.name ? ' error' : ''}`}
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Core Switch Floor 1" />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Device Type *</label>
              <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="switch">Switch</option>
                <option value="access_point">Access Point</option>
                <option value="router">Router</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Brand</label>
              <input className="form-input" value={form.brand}
                onChange={e => set('brand', e.target.value)} placeholder="e.g. Cisco" />
            </div>

            <div className="form-group">
              <label className="form-label">Model</label>
              <input className="form-input" value={form.model}
                onChange={e => set('model', e.target.value)} placeholder="e.g. Catalyst 9300" />
            </div>

            <div className="form-group full">
              <label className="form-label">Serial Number *</label>
              <input className={`form-input${errors.serial_number ? ' error' : ''}`}
                value={form.serial_number} onChange={e => set('serial_number', e.target.value)}
                placeholder="e.g. CSC-9300-001A" style={{ fontFamily: 'monospace' }} />
              {errors.serial_number && <span className="form-error">{errors.serial_number}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input type="number" min="0" className={`form-input${errors.quantity ? ' error' : ''}`}
                value={form.quantity} onChange={e => set('quantity', e.target.value)} />
              {errors.quantity && <span className="form-error">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location}
                onChange={e => set('location', e.target.value)} placeholder="e.g. Server Room A" />
            </div>
          </div>

          {errors._global && <p className="form-error" style={{ marginTop: '0.75rem' }}>{errors._global}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : device ? 'Save Changes' : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── ConfirmModal ─────────────────────────────────────────────────────────────
function ConfirmModal({ device, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title">Delete Device</span>
          <button className="btn-icon" onClick={onClose}><Icon d={icons.close} /></button>
        </div>
        <p className="confirm-msg">
          Are you sure you want to delete <span className="confirm-device-name">{device.name}</span>?
          <br />Serial: <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{device.serial_number}</span>
          <br />This action cannot be undone.
        </p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--danger)' }}
            onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [confirmDevice, setConfirmDevice] = useState(null);
  const { toasts, add: addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(API);
      setDevices(data);
    } catch {
      addToast('Failed to load devices', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  // Filter
  const filtered = devices.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      d.name.toLowerCase().includes(q) ||
      d.serial_number.toLowerCase().includes(q) ||
      d.brand?.toLowerCase().includes(q) ||
      d.model?.toLowerCase().includes(q) ||
      d.location?.toLowerCase().includes(q);
    const matchType   = typeFilter === 'all'   || d.type === typeFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // Stats
  const stats = {
    total:    devices.length,
    switches: devices.filter(d => d.type === 'switch').length,
    aps:      devices.filter(d => d.type === 'access_point').length,
    routers:  devices.filter(d => d.type === 'router').length,
  };

  // Quantity update
  const changeQty = async (id, delta) => {
    const device = devices.find(d => d.id === id);
    const newQty = Math.max(0, device.quantity + delta);
    try {
      const updated = await apiFetch(`${API}/${id}/quantity`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQty }),
      });
      setDevices(ds => ds.map(d => d.id === id ? updated : d));
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Save (add / edit)
  const handleSave = (saved, isNew) => {
    if (isNew) {
      setDevices(ds => [...ds, saved]);
      addToast(`${saved.name} added successfully`);
    } else {
      setDevices(ds => ds.map(d => d.id === saved.id ? saved : d));
      addToast(`${saved.name} updated`);
    }
    setShowAdd(false);
    setEditDevice(null);
  };

  // Delete
  const handleDelete = async () => {
    const id = confirmDevice.id;
    const name = confirmDevice.name;
    try {
      await apiFetch(`${API}/${id}`, { method: 'DELETE' });
      setDevices(ds => ds.filter(d => d.id !== id));
      addToast(`${name} deleted`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setConfirmDevice(null);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={icons.network} />
          </svg>
          NetInventory
        </div>
        <div className="header-actions">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            {filtered.length} of {devices.length} device{devices.length !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Icon d={icons.plus} size={16} /> Add Device
          </button>
        </div>
      </header>

      <main className="main">
        {/* Stats */}
        <div className="stats">
          <div className="stat-card total">
            <span className="label">Total Devices</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="stat-card switches">
            <span className="label">Switches</span>
            <span className="value">{stats.switches}</span>
          </div>
          <div className="stat-card aps">
            <span className="label">Access Points</span>
            <span className="value">{stats.aps}</span>
          </div>
          <div className="stat-card routers">
            <span className="label">Routers</span>
            <span className="value">{stats.routers}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrapper">
            <Icon d={icons.search} size={16} />
            <input className="search-input" placeholder="Search by name, serial, brand, model, location…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="switch">Switch</option>
            <option value="access_point">Access Point</option>
            <option value="router">Router</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading devices…</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Type</th>
                  <th>Serial Number</th>
                  <th>Brand / Model</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.5">
                          <path d={icons.box} />
                        </svg>
                        <p>No devices found. Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(device => (
                  <tr key={device.id}>
                    <td className="td-name">{device.name}</td>
                    <td>
                      <span className={`badge badge-${device.type}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d={TYPE_ICONS[device.type]} />
                        </svg>
                        {TYPE_LABELS[device.type]}
                      </span>
                    </td>
                    <td className="td-serial">{device.serial_number}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {[device.brand, device.model].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{device.location || '—'}</td>
                    <td>
                      <span className={`status-badge status-${device.status}`}>
                        {STATUS_LABELS[device.status] || device.status}
                      </span>
                    </td>
                    <td>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => changeQty(device.id, -1)}
                          disabled={device.quantity === 0} title="Decrease">−</button>
                        <span className="qty-num">{device.quantity}</span>
                        <button className="qty-btn" onClick={() => changeQty(device.id, 1)} title="Increase">+</button>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon" title="Edit device" onClick={() => setEditDevice(device)}>
                          <Icon d={icons.edit} size={16} />
                        </button>
                        <button className="btn-icon" title="Delete device"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => setConfirmDevice(device)}>
                          <Icon d={icons.trash} size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAdd   && <DeviceModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {editDevice && <DeviceModal device={editDevice} onClose={() => setEditDevice(null)} onSave={handleSave} />}
      {confirmDevice && <ConfirmModal device={confirmDevice} onClose={() => setConfirmDevice(null)} onConfirm={handleDelete} />}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
