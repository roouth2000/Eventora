import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Plus, MoreVertical, Check, Trash2, Printer, X, CreditCard } from 'lucide-react';

export default function Attendees() {
  const {
    attendees,
    ticketTypes,
    addAttendee,
    deleteAttendee,
    checkInAttendee,
    searchQuery,
    setSearchQuery
  } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTicket, setFilterTicket] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTicketType, setFormTicketType] = useState('Standard');
  const [formError, setFormError] = useState('');

  // Dropdown reference to click outside
  const menuRef = useRef(null);

  useEffect(() => {
    // Listen for custom trigger from dashboard quick action
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('open-add-attendee-modal', handleOpenModal);
    
    // Click outside listener for action menus
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('open-add-attendee-modal', handleOpenModal);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenAddModal = () => {
    setFormName('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormTicketType('Standard');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('Valid email is required');
      return;
    }
    
    addAttendee({
      name: formName.trim(),
      company: formCompany.trim() || 'Individual',
      email: formEmail.trim(),
      phone: formPhone.trim() || 'N/A',
      ticketType: formTicketType
    });

    setIsModalOpen(false);
  };

  const toggleCheckIn = (attendee) => {
    if (attendee.status === 'Checked In') {
      // Allow undo check-in for demo convenience
      attendee.status = 'Not Checked In';
      setActiveMenuId(null);
    } else {
      checkInAttendee(attendee.code);
      setActiveMenuId(null);
    }
  };

  // Filter attendees
  const filteredAttendees = attendees.filter(a => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      a.name.toLowerCase().includes(query) ||
      a.company.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      a.code.toLowerCase().includes(query) ||
      a.phone.includes(query);

    const matchesTicket = filterTicket === 'all' || a.ticketType === filterTicket;
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;

    return matchesSearch && matchesTicket && matchesStatus;
  });

  const getTicketColor = (ticketType) => {
    const config = ticketTypes.find(t => t.name === ticketType);
    return config ? config.color : 'var(--text-secondary)';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="attendees-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Attendees</h2>
          <p>Manage pre-registered attendees, ticket types, and check-in status.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add Attendee
        </button>
      </div>

      {/* Filters & Controls */}
      <div className="controls-row">
        <div className="search-box">
          <Search />
          <input 
            type="text" 
            placeholder="Search by name, phone, email, code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            className="custom-select"
            value={filterTicket}
            onChange={(e) => setFilterTicket(e.target.value)}
          >
            <option value="all">All Ticket Types</option>
            {ticketTypes.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>

          <select 
            className="custom-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Checked In">Checked In</option>
            <option value="Not Checked In">Not Checked In</option>
          </select>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Attendee</th>
              <th>Contact</th>
              <th>Ticket</th>
              <th>Status</th>
              <th>Code</th>
              <th>Created</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendees.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      className="initial-avatar"
                      style={{ backgroundColor: getTicketColor(a.ticketType) }}
                    >
                      {getInitials(a.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{a.company}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{a.phone}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{a.email}</div>
                </td>
                <td>
                  <span className={`badge badge-${a.ticketType.toLowerCase()}`}>
                    {a.ticketType}
                  </span>
                </td>
                <td>
                  <span className={`badge ${a.status === 'Checked In' ? 'badge-checked' : 'badge-not-checked'}`}>
                    {a.status}
                  </span>
                </td>
                <td>
                  <span className="badge-user-code">{a.code}</span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {a.createdAt}
                </td>
                <td>
                  <div className="action-dropdown-wrapper" ref={activeMenuId === a.id ? menuRef : null}>
                    <button 
                      className="icon-btn" 
                      style={{ border: 'none', width: '30px', height: '30px' }}
                      onClick={() => setActiveMenuId(activeMenuId === a.id ? null : a.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenuId === a.id && (
                      <div className="action-dropdown-list">
                        <div className="action-dropdown-item" onClick={() => toggleCheckIn(a)}>
                          <Check size={14} /> {a.status === 'Checked In' ? 'Undo Check-in' : 'Check In'}
                        </div>
                        <div className="action-dropdown-item" onClick={() => deleteAttendee(a.id)}>
                          <Trash2 size={14} /> Delete
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredAttendees.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No attendees matching filters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Attendee Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Attendee</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              {formError && (
                <div style={{ color: '#ff7675', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                  {formError}
                </div>
              )}
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company / Organization</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Acme Corp"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="e.g. john@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. +91 9876543210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Ticket Tier</label>
                <select 
                  className="form-control"
                  value={formTicketType}
                  onChange={(e) => setFormTicketType(e.target.value)}
                >
                  {ticketTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Attendee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
