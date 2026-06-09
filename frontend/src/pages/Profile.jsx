import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { api } from '../utils/api';
import { User, Mail, ShieldAlert, KeyRound, Save, BadgeCheck, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, syncUserProfile, logoutUser } = useContext(AppContext);

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    try {
      await api.updateProfile(name, email);
      await syncUserProfile();
      setProfileSuccess('Profile details updated successfully!');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long');
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdError(err.message || 'Failed to change password. Validate current password.');
    }
  };

  return (
    <div className="profile-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>User Profile</h2>
          <p>Manage your account credentials, security access levels, and settings.</p>
        </div>
        <button className="btn btn-secondary" style={{ color: '#ff7675', borderColor: '#ff7675' }} onClick={logoutUser}>
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="dashboard-card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 0 24px' }}>
            <div className="avatar-badge" style={{ width: '64px', height: '64px', fontSize: '24px', marginBottom: '16px' }}>
              {user?.name ? user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{user?.name}</h3>
            <span className="badge badge-vip" style={{ marginTop: '8px', textTransform: 'uppercase' }}>
              {user?.role}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700, marginTop: '12px' }}>
              <BadgeCheck size={14} /> Account Verified & Active
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Registered Email:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Role Permissions:</span>
              <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {user?.role === 'organizer' ? 'Organize Events' : 'Attend Events'}
              </strong>
            </div>
          </div>
        </div>

        {/* Update Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Edit Profile Form */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <User size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Profile Details</h3>
            </div>

            {profileSuccess && <div style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px', marginBottom: '16px' }}>{profileSuccess}</div>}
            {profileError && <div style={{ color: '#ff7675', fontWeight: 600, fontSize: '13px', marginBottom: '16px' }}>{profileError}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={14} /> Update Info
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <KeyRound size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Change Password</h3>
            </div>

            {pwdSuccess && <div style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px', marginBottom: '16px' }}>{pwdSuccess}</div>}
            {pwdError && <div style={{ color: '#ff7675', fontWeight: 600, fontSize: '13px', marginBottom: '16px' }}>{pwdError}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary">
                  <KeyRound size={14} /> Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
