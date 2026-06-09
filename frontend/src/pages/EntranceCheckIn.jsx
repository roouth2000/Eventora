import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ScanLine, Check, AlertCircle, X, User } from 'lucide-react';

export default function EntranceCheckIn() {
  const { checkInAttendee, attendees, ticketTypes } = useContext(AppContext);
  
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null); // { success: boolean, message: string, attendee?: object }

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    const res = checkInAttendee(code);
    setResult(res);
    setCode('');
  };

  const getTicketColor = (ticketType) => {
    const config = ticketTypes.find(t => t.name === ticketType);
    return config ? config.color : 'var(--text-secondary)';
  };

  // Get last 3 checked-in attendees
  const recentCheckedIn = attendees
    .filter(a => a.status === 'Checked In')
    .slice(0, 3);

  return (
    <div className="entrance-checkin-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Entrance Check-in</h2>
          <p>Scan barcode or enter attendee check-in codes at the event gate.</p>
        </div>
      </div>

      <div className="checkin-panel">
        <div className="logo-icon" style={{ margin: '0 auto 16px', width: '48px', height: '48px' }}>
          <ScanLine size={24} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Scan Gate Ticket</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Enter the attendee badge code (e.g., EPM-1002) to verify registration and record gate entry.
        </p>

        <form onSubmit={handleCheckInSubmit}>
          <div className="checkin-input-wrapper">
            <input 
              type="text" 
              className="checkin-input"
              placeholder="ENTER TICKET CODE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            Verify & Check In
          </button>
        </form>

        {/* Result Indicator Card */}
        {result && (
          <div className="checkin-result">
            {result.success ? (
              <>
                <div className="checkin-status-icon success">
                  <Check size={32} />
                </div>
                <div className="checkin-result-name">{result.attendee.name}</div>
                <div className="checkin-result-meta">{result.attendee.company}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge badge-${result.attendee.ticketType.toLowerCase()}`}>
                    {result.attendee.ticketType}
                  </span>
                  <span className="badge-user-code">{result.attendee.code}</span>
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  {result.message}
                </div>
              </>
            ) : (
              <>
                <div className="checkin-status-icon error">
                  {result.attendee ? <AlertCircle size={32} /> : <X size={32} />}
                </div>
                {result.attendee ? (
                  <>
                    <div className="checkin-result-name">{result.attendee.name}</div>
                    <div className="checkin-result-meta">{result.attendee.company}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                      <span className={`badge badge-${result.attendee.ticketType.toLowerCase()}`}>
                        {result.attendee.ticketType}
                      </span>
                      <span className="badge-user-code">{result.attendee.code}</span>
                    </div>
                  </>
                ) : (
                  <div className="checkin-result-name" style={{ fontSize: '16px' }}>Unknown Ticket</div>
                )}
                <div style={{ fontSize: '12px', color: '#ff7675', fontWeight: 600 }}>
                  {result.message}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentCheckedIn.length > 0 && (
        <div className="dashboard-card" style={{ maxWidth: '600px', margin: '24px auto 0' }}>
          <div className="dashboard-card-title" style={{ fontSize: '14px', marginBottom: '12px' }}>
            Recently Checked In
          </div>
          <div className="activity-list">
            {recentCheckedIn.map(a => (
              <div key={a.id} className="activity-item">
                <div className="activity-details">
                  <div 
                    className="initial-avatar"
                    style={{ backgroundColor: getTicketColor(a.ticketType), width: '30px', height: '30px', fontSize: '11px' }}
                  >
                    {a.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="activity-title" style={{ fontSize: '12px' }}>
                      {a.name}
                    </div>
                    <div className="activity-time" style={{ fontSize: '10px' }}>
                      {a.company} &bull; {a.code}
                    </div>
                  </div>
                </div>
                <span className="badge badge-checked" style={{ fontSize: '10px', padding: '2px 8px' }}>
                  Checked In
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
