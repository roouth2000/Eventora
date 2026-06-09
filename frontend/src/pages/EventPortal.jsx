import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { Search, Plus, Calendar, MapPin, DollarSign, Users, Trash2, Edit2, Link, Globe, CheckCircle2, ChevronRight, X, QrCode, Download } from 'lucide-react';

export default function EventPortal() {
  const {
    user,
    events,
    myEvents,
    backendLoading,
    backendError,
    loadBackendData,
    triggerCreateEvent,
    triggerAttendEvent,
    triggerDeleteEvent,
    triggerUpdateEvent,
    showToast,
    setActiveView
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'attending', 'organized'
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrEvent, setQrEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  
  // Create Event Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [category, setCategory] = useState('conference');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueState, setVenueState] = useState('');
  const [venueCountry, setVenueCountry] = useState('India');
  const [venueZipCode, setVenueZipCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [tags, setTags] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadBackendData();
  }, []);

  useEffect(() => {
    if (isModalOpen || qrEvent || deletingEventId) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isModalOpen, qrEvent, deletingEventId]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (new Date(endDate) <= new Date(startDate)) {
      const msg = 'End Date must be after Start Date';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const eventPayload = {
      title,
      description: description.trim() || `Event details and summary description for ${title}.`,
      shortDescription: shortDesc.trim() || `Summary of ${title}.`,
      category,
      venueName: venueName || 'Convention Hall',
      venueAddress: venueAddress || '123 Tech Avenue',
      venueCity: venueCity || 'Delhi',
      venueState: venueState || 'Delhi',
      venueCountry: venueCountry || 'India',
      venueZipCode: venueZipCode || '110001',
      isOnline: false,
      onlineLink: undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      capacity: capacity ? parseInt(capacity, 10) : 100,
      ticketPrice: isFree ? 0 : parseFloat(ticketPrice),
      isFree,
      tags: tagsArray.length > 0 ? tagsArray : ['event'],
      status: 'published'
    };

    const res = await triggerCreateEvent(eventPayload);
    if (res.success) {
      setIsModalOpen(false);
      resetForm();
      showToast('Event created successfully!', 'success');
    } else {
      setErrorMsg(res.message || 'Failed to create event. Verify fields.');
      showToast(res.message || 'Failed to create event. Verify fields.', 'error');
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setTitle(event.title || '');
    setDescription(event.description || '');
    setShortDesc(event.shortDescription || '');
    setCategory(event.category || 'conference');
    setVenueName(event.venueName || '');
    setVenueAddress(event.venueAddress || '');
    setVenueCity(event.venueCity || '');
    setVenueState(event.venueState || '');
    setVenueCountry(event.venueCountry || 'India');
    setVenueZipCode(event.venueZipCode || '');
    
    if (event.startDate) {
      const startDt = new Date(event.startDate);
      const localStart = new Date(startDt.getTime() - startDt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setStartDate(localStart);
    } else {
      setStartDate('');
    }
    
    if (event.endDate) {
      const endDt = new Date(event.endDate);
      const localEnd = new Date(endDt.getTime() - endDt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEndDate(localEnd);
    } else {
      setEndDate('');
    }
    
    setCapacity(event.capacity || '');
    setTicketPrice(event.ticketPrice || '');
    setIsFree(event.isFree ?? true);
    setTags(event.tags ? event.tags.join(', ') : '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (new Date(endDate) <= new Date(startDate)) {
      const msg = 'End Date must be after Start Date';
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const eventPayload = {
      title,
      description: description.trim() || `Event details and summary description for ${title}.`,
      shortDescription: shortDesc.trim() || `Summary of ${title}.`,
      category,
      venueName: venueName || 'Convention Hall',
      venueAddress: venueAddress || '123 Tech Avenue',
      venueCity: venueCity || 'Delhi',
      venueState: venueState || 'Delhi',
      venueCountry: venueCountry || 'India',
      venueZipCode: venueZipCode || '110001',
      isOnline: false,
      onlineLink: undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      capacity: capacity ? parseInt(capacity, 10) : 100,
      ticketPrice: isFree ? 0 : parseFloat(ticketPrice),
      isFree,
      tags: tagsArray.length > 0 ? tagsArray : ['event'],
      status: 'published'
    };

    const res = await triggerUpdateEvent(editingEvent.id, eventPayload);
    if (res.success) {
      setIsModalOpen(false);
      setEditingEvent(null);
      resetForm();
      showToast('Event updated successfully!', 'success');
    } else {
      setErrorMsg(res.message || 'Failed to update event. Verify fields.');
      showToast(res.message || 'Failed to update event. Verify fields.', 'error');
    }
  };

  const handleSubmit = (e) => {
    if (editingEvent) {
      handleUpdateSubmit(e);
    } else {
      handleCreateSubmit(e);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setShortDesc('');
    setCategory('conference');
    setVenueName('');
    setVenueAddress('');
    setVenueCity('');
    setVenueState('');
    setVenueCountry('India');
    setVenueZipCode('');
    setStartDate('');
    setEndDate('');
    setCapacity('');
    setTicketPrice('');
    setIsFree(true);
    setTags('');
    setErrorMsg('');
  };

  const isUserRegistered = (eventId) => {
    return myEvents.some(me => me.id === eventId && me.EventAttendee);
  };

  const handleAttend = async (eventId) => {
    const res = await triggerAttendEvent(eventId);
    if (res.success) {
      showToast('Registered for event successfully!', 'success');
    } else {
      showToast(res.message || 'Failed to register registration.', 'error');
    }
  };

  const handleDeleteClick = (eventId) => {
    setDeletingEventId(eventId);
  };

  const handleConfirmDelete = async () => {
    const res = await triggerDeleteEvent(deletingEventId);
    if (res.success) {
      setDeletingEventId(null);
      showToast('Event deleted successfully.', 'success');
    } else {
      showToast(res.message || 'Failed to delete event.', 'error');
    }
  };

  // Filter Logic
  const getFilteredEvents = () => {
    let list = events;
    if (activeTab === 'attending') {
      list = myEvents;
    } else if (activeTab === 'organized') {
      list = events.filter(e => e.organizerId === user?.id);
    }

    return list.filter(e => {
      const matchesSearch = 
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const displayList = getFilteredEvents();

  return (
    <div className="event-portal-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Event Portal</h2>
          <p>Explore conferences, workshops, and concerts, or host and manage your own events.</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => { setEditingEvent(null); resetForm(); setIsModalOpen(true); }}>
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', paddingBottom: '4px' }}>
        <button 
          onClick={() => setActiveTab('all')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '10px 16px',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'all' ? 'var(--accent-purple)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'all' ? '2px solid var(--accent-purple)' : '2px solid transparent'
          }}
        >
          All Events
        </button>
        {user && (
          <>
            <button 
              onClick={() => setActiveTab('attending')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '10px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                color: activeTab === 'attending' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'attending' ? '2px solid var(--accent-purple)' : '2px solid transparent'
              }}
            >
              My Registrations
            </button>
            {(user.role === 'organizer' || user.role === 'admin') && (
              <button 
                onClick={() => setActiveTab('organized')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: activeTab === 'organized' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'organized' ? '2px solid var(--accent-purple)' : '2px solid transparent'
                }}
              >
                Organized Events
              </button>
            )}
          </>
        )}
      </div>

      {/* Search & Categories */}
      <div className="controls-row">
        <div className="search-box">
          <Search />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select 
            className="custom-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="concert">Concert</option>
            <option value="sports">Sports</option>
            <option value="networking">Networking</option>
            <option value="exhibition">Exhibition</option>
            <option value="festival">Festival</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {backendError && (
        <div style={{ color: '#ff7675', fontWeight: 600, marginBottom: '16px' }}>
          {backendError}
        </div>
      )}

      {/* Event Cards Grid */}
      {backendLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Syncing with backend API...
        </div>
      ) : (
        <div className="badge-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {displayList.map(e => {
            const isReg = isUserRegistered(e.id);
            const isMyOrg = !!user;

            return (
              <div key={e.id} className="badge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="badge badge-vip" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                      {e.category}
                    </span>
                    {isMyOrg && (
                      <div className="card-actions" style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 5 }}>
                        <button 
                          className="icon-btn" 
                          style={{ border: 'none', width: '28px', height: '28px', color: 'var(--accent-purple)' }}
                          onClick={() => handleEditClick(e)}
                          title="Edit Event"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="icon-btn" 
                          style={{ border: 'none', width: '28px', height: '28px', color: '#ff7675' }}
                          onClick={() => handleDeleteClick(e.id)}
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {e.title}
                  </h3>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {e.shortDescription || e.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <Calendar size={13} style={{ marginTop: '2px' }} />
                      <div>
                        <div><strong>From:</strong> {new Date(e.startDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div><strong>To:</strong> {new Date(e.endDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} />
                      <span>{e.isOnline ? 'Online Link' : (e.venueName || 'Venue TBD')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={13} />
                      <span>{e.attendeeCount || 0} attending {e.capacity ? `(Max ${e.capacity})` : ''}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {e.isFree ? 'Free' : `₹${e.ticketPrice}`}
                    <button 
                      className="icon-btn" 
                      style={{ border: 'none', width: '28px', height: '28px', color: 'var(--accent-purple)' }}
                      onClick={() => setQrEvent(e)}
                      title="Show Event QR Code"
                    >
                      <QrCode size={14} />
                    </button>
                  </div>
                  
                  {user ? (
                    isReg ? (
                      <span className="badge badge-checked" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Registered
                      </span>
                    ) : (
                      <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleAttend(e.id)}>
                        Register
                      </button>
                    )
                  ) : (
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => setActiveView('auth')}>
                      Login to Attend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {displayList.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No events found matching current criteria.
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
              <button className="close-btn" onClick={() => { setIsModalOpen(false); setEditingEvent(null); resetForm(); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{ color: '#ff7675', fontWeight: 600, marginBottom: '16px', fontSize: '13px' }}>
                  {errorMsg}
                </div>
              )}
              
              <div className="form-group">
                <label>Event Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Annual Tech Symposium" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="concert">Concert</option>
                    <option value="sports">Sports</option>
                    <option value="networking">Networking</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="festival">Festival</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity limit</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 500" 
                    value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Short Summary</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Brief description max 300 chars" 
                  value={shortDesc} 
                  onChange={(e) => setShortDesc(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Detailed Description</label>
                <textarea 
                  className="form-control" 
                  style={{ height: '80px' }}
                  placeholder="Elaborate on details, speakers, agenda..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input type="datetime-local" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>End Date & Time</label>
                  <input type="datetime-local" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Venue Name</label>
                  <input type="text" className="form-control" placeholder="Convention Center" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" className="form-control" placeholder="123 Main St" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="form-control" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" className="form-control" value={venueState} onChange={(e) => setVenueState(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input type="text" className="form-control" value={venueZipCode} onChange={(e) => setVenueZipCode(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-primary)', borderRadius: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>Free Tickets</span>
                  <label className="switch">
                    <input type="checkbox" checked={isFree} onChange={() => setIsFree(!isFree)} />
                    <span className="slider"></span>
                  </label>
                </div>
                {!isFree && (
                  <div className="form-group">
                    <label>Ticket Price (₹)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g. 499" 
                      value={ticketPrice} 
                      onChange={(e) => setTicketPrice(e.target.value)} 
                      required={!isFree}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tags (Comma Separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="tech, coding, ai" 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)} 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsModalOpen(false); setEditingEvent(null); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingEvent ? 'Update Event' : 'Publish Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event QR Code Modal */}
      {qrEvent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Event Access QR</h3>
              <button className="close-btn" onClick={() => setQrEvent(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '10px 0' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{qrEvent.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Scan to navigate to this event registration page.
              </p>
              
              <div className="badge-qr-container" style={{ width: '180px', height: '180px', padding: '14px', margin: '24px auto 16px' }}>
                <EventQrCodeSvg value={`${window.location.origin}/events/${qrEvent.slug}`} />
              </div>
              
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '6px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {window.location.origin}/events/{qrEvent.slug}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setQrEvent(null)}>
                Close
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                const svgElement = document.getElementById('event-qr-svg');
                const svgString = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = svgUrl;
                downloadLink.download = `${qrEvent.title.toLowerCase().replace(/\s+/g, '-')}-qr.svg`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
              }}>
                <Download size={14} /> Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEventId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={() => setDeletingEventId(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '16px 0 8px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 118, 117, 0.1)', color: '#ff7675', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={24} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Are you sure?</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                Do you really want to delete this event? This action cannot be undone and will cancel all attendee registrations.
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeletingEventId(null)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1, background: '#ff7675', borderColor: '#ff7675' }} 
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Scannable SVG QR code for Event details using qrcode.react
function EventQrCodeSvg({ value }) {
  return (
    <QRCodeSVG 
      id="event-qr-svg" 
      value={value} 
      size={180} 
      level="H" 
      style={{ width: '100%', height: '100%' }}
    />
  );
}
