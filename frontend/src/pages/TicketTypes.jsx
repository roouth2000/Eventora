import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Edit2, Check, X, Award } from 'lucide-react';

export default function TicketTypes() {
  const { 
    ticketTypes, 
    privileges, 
    attendees, 
    updateTicketPrivileges,
    addTicketType 
  } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Create state
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#6c5ce7');
  const [newTypePrivs, setNewTypePrivs] = useState([]);

  // Edit state
  const [editingTicket, setEditingTicket] = useState(null); // ticket object
  const [editingPrivs, setEditingPrivs] = useState([]); // array of names

  // KPI Calculations
  const getAttendeeCount = (ticketName) => {
    return attendees.filter(a => a.ticketType === ticketName).length;
  };

  const handleOpenEdit = (ticket) => {
    setEditingTicket(ticket);
    setEditingPrivs([...ticket.privileges]);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateTicketPrivileges(editingTicket.name, editingPrivs);
    setIsEditModalOpen(false);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    addTicketType(newTypeName.trim(), newTypeDesc.trim(), newTypeColor, newTypePrivs);
    setIsModalOpen(false);
    
    // reset
    setNewTypeName('');
    setNewTypeDesc('');
    setNewTypeColor('#6c5ce7');
    setNewTypePrivs([]);
  };

  const handleTogglePrivilegeInList = (privName, isEdit) => {
    if (isEdit) {
      setEditingPrivs(prev => 
        prev.includes(privName) 
          ? prev.filter(p => p !== privName) 
          : [...prev, privName]
      );
    } else {
      setNewTypePrivs(prev => 
        prev.includes(privName) 
          ? prev.filter(p => p !== privName) 
          : [...prev, privName]
      );
    }
  };

  return (
    <div className="ticket-types-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Ticket Types</h2>
          <p>Define the tiers attendees can purchase and the privileges they unlock.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add Ticket Type
        </button>
      </div>

      <div className="ticket-grid">
        {ticketTypes.map(t => {
          const attendeeCount = getAttendeeCount(t.name);
          const activePrivs = t.privileges.length;
          const totalPrivs = privileges.length;

          return (
            <div key={t.id} className="ticket-card">
              <div>
                <div className="ticket-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="ticket-card-color-indicator" style={{ backgroundColor: t.color }}></div>
                    <span className="ticket-card-title">{t.name}</span>
                  </div>
                  <button 
                    className="icon-btn" 
                    style={{ border: 'none', width: '32px', height: '32px' }}
                    onClick={() => handleOpenEdit(t)}
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="ticket-card-desc">{t.description}</div>
              </div>

              <div className="ticket-card-stats">
                <div className="ticket-stat">
                  <span className="ticket-stat-label">Privileges</span>
                  <span className="ticket-stat-value">{activePrivs}/{totalPrivs}</span>
                </div>
                <div className="ticket-stat">
                  <span className="ticket-stat-label">Attendees</span>
                  <span className="ticket-stat-value">{attendeeCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Ticket Privileges Modal */}
      {isEditModalOpen && editingTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>Edit Privileges: {editingTicket.name}</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Select the booths/stalls that the <strong>{editingTicket.name}</strong> ticket holders are authorized to redeem.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {privileges.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => handleTogglePrivilegeInList(p.name, true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      backgroundColor: editingPrivs.includes(p.name) ? 'var(--accent-purple-light)' : 'transparent',
                      borderColor: editingPrivs.includes(p.name) ? 'var(--accent-purple)' : 'var(--border-color)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.location}</div>
                    </div>
                    {editingPrivs.includes(p.name) && (
                      <Check size={18} color="var(--accent-purple)" />
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Ticket Type Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Ticket Type</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label>Ticket Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. VIP Platinum"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Access to all keynotes + Gala Dinner"
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Indicator Color</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#6c5ce7', '#0284c7', '#00b894', '#fdcb6e', '#e17055', '#e84393'].map(c => (
                    <div 
                      key={c}
                      onClick={() => setNewTypeColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        cursor: 'pointer',
                        border: newTypeColor === c ? '3px solid var(--text-primary)' : '1px solid transparent',
                        transform: newTypeColor === c ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Assign Privileges</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {privileges.map(p => {
                    const isSelected = newTypePrivs.includes(p.name);
                    return (
                      <span 
                        key={p.id}
                        onClick={() => handleTogglePrivilegeInList(p.name, false)}
                        className={`badge`}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--accent-purple)' : 'var(--bg-primary)',
                          color: isSelected ? 'white' : 'var(--text-secondary)',
                          border: `1px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                          padding: '6px 12px',
                          borderRadius: '16px'
                        }}
                      >
                        {p.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
