import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, ToggleLeft, ToggleRight, MapPin, Clock, Award, X } from 'lucide-react';

export default function Privileges() {
  const { privileges, togglePrivilegeStatus, addPrivilege } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Privilege Form State
  const [privName, setPrivName] = useState('');
  const [privLocation, setPrivLocation] = useState('');
  const [privTime, setPrivTime] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!privName.trim()) return;

    addPrivilege(
      privName.trim(),
      privLocation.trim() || 'General Venue',
      privTime.trim() || 'All Day'
    );

    setIsModalOpen(false);
    setPrivName('');
    setPrivLocation('');
    setPrivTime('');
  };

  return (
    <div className="privileges-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Privileges</h2>
          <p>Configure privileges and assign them to ticket types.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add Privilege
        </button>
      </div>

      <div className="privilege-config-list">
        {privileges.map(p => (
          <div key={p.id} className="privilege-config-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                className="logo-icon" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: p.active ? 'var(--gradient-primary)' : '#94a3b8',
                  borderRadius: '10px'
                }}
              >
                <Award size={18} color="white" />
              </div>
              <div className="privilege-config-info">
                <h4 style={{ color: p.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {p.name}
                  {!p.active && <span style={{ fontSize: '11px', color: '#ff7675', fontWeight: 600, marginLeft: '8px' }}>(Inactive)</span>}
                </h4>
                <div className="privilege-config-meta">
                  <div className="privilege-config-meta-item">
                    <MapPin />
                    <span>{p.location}</span>
                  </div>
                  <div className="privilege-config-meta-item">
                    <Clock />
                    <span>{p.time}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={p.active} 
                  onChange={() => togglePrivilegeStatus(p.name)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Privilege Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Privilege</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Privilege Name / Stall</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. High Tea, VIP Lounge"
                  value={privName}
                  onChange={(e) => setPrivName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location Counter / Room</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Hall A - Stall 5"
                  value={privLocation}
                  onChange={(e) => setPrivLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Operating Hours / Timing</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. 10:30 - 11:30 or All Day"
                  value={privTime}
                  onChange={(e) => setPrivTime(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Privilege
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
