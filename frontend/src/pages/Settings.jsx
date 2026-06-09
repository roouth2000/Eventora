import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Database, ShieldAlert, UserCheck } from 'lucide-react';

export default function Settings() {
  const [eventName, setEventName] = useState('TechFest 2026');
  const [eventVenue, setEventVenue] = useState('Main Convention Center, Hall B');
  const [apiUrl, setApiUrl] = useState('https://eventora.heavenwebtechnologies.com/api/v1');
  const [simMode, setSimMode] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Settings</h2>
          <p>Configure event parameters, database schemas, and terminal API gateways.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left Side: Settings Navigation tabs */}
        <div className="settings-nav">
          <div className="settings-nav-item active">General Configuration</div>
          <div className="settings-nav-item" onClick={() => alert('Security & Roles settings are managed on the Node.js backend')}>
            Terminal Authentication
          </div>
          <div className="settings-nav-item" onClick={() => alert('Database migration configurations require superadmin access')}>
            Database Integrations
          </div>
        </div>

        {/* Right Side: Tab Contents Form */}
        <div className="dashboard-card">
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <SettingsIcon size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>General Setup</h3>
            </div>

            <div className="form-group">
              <label>Event Name</label>
              <input 
                type="text" 
                className="form-control"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Event Location / Venue</label>
              <input 
                type="text" 
                className="form-control"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>API Gateway Endpoint</label>
              <input 
                type="text" 
                className="form-control"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Database size={18} color="var(--accent-purple)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>Simulation / Sandbox Mode</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Persists all data modifications locally in browser state.
                    </div>
                  </div>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={simMode}
                    onChange={() => setSimMode(!simMode)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={14} /> Save Settings
              </button>
            </div>
          </form>

          {/* User Status Card */}
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: 'rgba(108, 92, 231, 0.05)' }}>
            <div style={{ color: 'var(--accent-purple)' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Terminal Operator Profile</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Logged in as <strong>Admin Organizer</strong>. You have permissions to read registers, check-in guests, configure tickets, and execute stall scans.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
