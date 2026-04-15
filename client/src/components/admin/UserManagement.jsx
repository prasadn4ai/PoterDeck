import React, { useEffect, useState } from 'react';
import { Button } from '../shared/Button';
import api from '../../services/apiService';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?page=${p}&limit=20`);
      setUsers(data.users); setTotal(data.total); setPage(p);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (userId, action) => {
    try {
      if (action === 'suspend') await api.patch(`/admin/users?id=${userId}`, { status: 'suspended' });
      else if (action === 'activate') await api.patch(`/admin/users?id=${userId}`, { status: 'active' });
      else if (action === 'delete') { if (confirm('Delete this user?')) await api.delete(`/admin/users?id=${userId}`); }
      fetchUsers(page);
    } catch (err) { alert(err.response?.data?.error || 'Action failed'); }
  };

  if (loading) return <div style={{ color: 'var(--color-text-muted)' }}>Loading users...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>User Management ({total} total)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
            {['Email', 'Role', 'Status', 'Decks', 'Tier', 'Actions'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px 12px' }}>{u.email}</td>
              <td style={{ padding: '8px 12px' }}>{u.role}</td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ color: u.status === 'active' ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>{u.status}</span>
              </td>
              <td style={{ padding: '8px 12px' }}>{u.monthly_deck_count}/{u.max_decks_per_month}</td>
              <td style={{ padding: '8px 12px' }}>{u.max_slides_per_deck} slides/deck</td>
              <td style={{ padding: '8px 12px', display: 'flex', gap: '6px' }}>
                <Button size="sm" variant="secondary" onClick={() => handleAction(u.id, u.status === 'active' ? 'suspend' : 'activate')}>
                  {u.status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleAction(u.id, 'delete')}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {total > 20 && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>Prev</Button>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', padding: '6px' }}>Page {page}</span>
          <Button size="sm" variant="secondary" disabled={page * 20 >= total} onClick={() => fetchUsers(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
