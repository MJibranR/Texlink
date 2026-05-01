'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  full_name: string;
  email: string;
  company_name: string;
  phone: string;
  role: string;
  city: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRole, setFilterRole] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    city: '',
    role: '',
    is_verified: false
  });

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/marketplace');
      return;
    }
    
    await fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...users];
    
    if (search) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.company_name && user.company_name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    if (filterVerification !== 'all') {
      const isVerified = filterVerification === 'verified';
      filtered = filtered.filter(user => user.is_verified === isVerified);
    }
    
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.full_name.localeCompare(a.full_name));
        break;
      case 'email_asc':
        filtered.sort((a, b) => a.email.localeCompare(b.email));
        break;
    }
    
    setFilteredUsers(filtered);
  }, [users, search, sortBy, filterRole, filterVerification]);

  const handleVerifyUser = async (userId: number, verified: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, action: 'verify', is_verified: verified })
      });
      
      if (res.ok) {
        await fetchUsers();
        alert(`User ${verified ? 'verified' : 'unverified'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, action: 'role', role: newRole })
      });
      
      if (res.ok) {
        await fetchUsers();
        alert(`User role updated to ${newRole}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

const handleDeleteUser = async (userId: number, userEmail: string) => {
  // First, check if user has a seller application
  try {
    const token = localStorage.getItem('token');
    
    // Check for seller application
    const appRes = await fetch(`/api/admin/applications?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const applications = await appRes.json();
    const hasApplication = applications && applications.length > 0;
    
    if (hasApplication) {
      const confirmMessage = `This user has an approved seller application.\n\nWould you like to:\n• Click OK to delete the seller application first, then delete the user\n• Click Cancel to cancel deletion`;
      
      if (confirm(confirmMessage)) {
        // First delete the seller application
        const deleteAppRes = await fetch(`/api/admin/applications?userId=${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (deleteAppRes.ok) {
          alert('Seller application deleted successfully. Now deleting user...');
          // Then delete the user
          await deleteUser(userId);
        } else {
          alert('Failed to delete seller application. Please try again.');
          return;
        }
      } else {
        return;
      }
    } else {
      // No application, directly delete user
      if (confirm(`Are you sure you want to permanently delete user ${userEmail}? This action cannot be undone.`)) {
        await deleteUser(userId);
      }
    }
  } catch (error) {
    console.error('Error checking seller application:', error);
    alert('Error checking seller application. Please try again.');
  }
};

const deleteUser = async (userId: number) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/users?userId=${userId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (res.ok) {
      alert('User deleted successfully!');
      await fetchUsers(); // Refresh the list
    } else {
      alert(data.error || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Failed to delete user: ' + (error as Error).message);
  }
};

  const handleEditUser = (user: User) => {
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      company_name: user.company_name || '',
      city: user.city || '',
      role: user.role,
      is_verified: user.is_verified
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          action: 'update',
          ...editForm 
        })
      });
      
      if (res.ok) {
        await fetchUsers();
        alert('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      admin: { bg: '#e74c3c', color: 'white' },
      seller: { bg: '#27ae60', color: 'white' },
      buyer: { bg: '#3498db', color: 'white' }
    };
    const style = colors[role] || colors.buyer;
    return <span style={{ background: style.bg, color: style.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{role}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="header">
        <div>
          <h1>Manage Users</h1>
          <p className="subtitle">Total {filteredUsers.length} users found</p>
        </div>
        <Link href="/admin/users/add" className="btn-add">
          + Add New User
        </Link>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="email_asc">Email (A-Z)</option>
        </select>
        
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="filter-select">
          <option value="all">All Roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
        
        <select value={filterVerification} onChange={(e) => setFilterVerification(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
        
        <button onClick={() => {
          setSearch('');
          setSortBy('newest');
          setFilterRole('all');
          setFilterVerification('all');
        }} className="clear-btn">
          Clear All
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Company</th>
              <th>Role</th>
              <th>City</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="user-name">{user.full_name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td><p className="user-phone">{user.phone || '—'}</p></td>
                <td><p className="user-company">{user.company_name || '—'}</p></td>
                <td>
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td><span className="user-city">{user.city || '—'}</span></td>
                <td>
                  <button
                    onClick={() => handleVerifyUser(user.id, !user.is_verified)}
                    className={`verify-btn ${user.is_verified ? 'verified' : 'unverified'}`}
                  >
                    {user.is_verified ? '✓ Verified' : '⏳ Pending'}
                  </button>
                </td>
                <td><span className="join-date">{new Date(user.created_at).toLocaleDateString()}</span></td>
                <td className="actions">
                  <button onClick={() => handleEditUser(user)} className="btn-edit" title="Edit User">✏️</button>
                  <button 
                      onClick={() => handleDeleteUser(user.id, user.email)} 
                      className="btn-delete" 
                      title="Delete User"
                    >
                      🗑️
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="no-results">
            <p>No users found matching your filters.</p>
            <button onClick={() => {
              setSearch('');
              setFilterRole('all');
              setFilterVerification('all');
            }}>Clear filters</button>
          </div>
        )}
      </div>

      {showEditModal && selectedUser && (
        <div className="modal" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" value={editForm.company_name} onChange={(e) => setEditForm({...editForm, company_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group checkbox">
              <label>
                <input type="checkbox" checked={editForm.is_verified} onChange={(e) => setEditForm({...editForm, is_verified: e.target.checked})} />
                Verified User
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveEdit} className="btn-save">Save Changes</button>
              <button onClick={() => setShowEditModal(false)} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-users { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .header h1 { font-size: 32px; color: #333; margin-bottom: 5px; }
        .subtitle { color: #666; font-size: 14px; }
        .btn-add { background: #27ae60; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; }
        .filters-bar { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }
        .search-box { flex: 2; min-width: 200px; }
        .search-input { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
        .filter-select { padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; background: white; cursor: pointer; }
        .clear-btn { padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; }
        .users-table-container { background: white; border-radius: 12px; overflow-x: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .users-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
        .users-table th, .users-table td { padding: 16px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        .users-table th { background: #f8f9fa; font-weight: 600; color: #555; }
        .user-cell { display: flex; align-items: center; gap: 12px; }
        .user-avatar { width: 40px; height: 40px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; }
        .user-name { font-weight: 600; margin-bottom: 4px; }
        .user-email { font-size: 12px; color: #666; }
        .role-select { padding: 6px 10px; border: 1px solid #e0e0e0; border-radius: 6px; background: white; cursor: pointer; }
        .verify-btn { padding: 4px 12px; border: none; border-radius: 20px; cursor: pointer; font-size: 12px; }
        .verify-btn.verified { background: #d4edda; color: #155724; }
        .verify-btn.unverified { background: #fff3cd; color: #856404; }
        .actions { display: flex; gap: 8px; }
        .btn-edit, .btn-delete { padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
        .btn-edit { background: #3498db; color: white; }
        .btn-delete { background: #e74c3c; color: white; }
        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; border-radius: 12px; padding: 30px; width: 500px; max-width: 90%; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; }
        .form-group.checkbox label { display: flex; align-items: center; gap: 10px; }
        .form-group.checkbox input { width: auto; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .btn-save { background: #27ae60; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
        .btn-cancel { background: #95a5a6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
        .no-results { text-align: center; padding: 50px; color: #666; }
      `}</style>
    </div>
  );
}