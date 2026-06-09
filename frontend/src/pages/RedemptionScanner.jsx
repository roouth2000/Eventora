import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Scan, Check, AlertTriangle, Play, History, ArrowRight, CornerDownRight } from 'lucide-react';

export default function RedemptionScanner() {
  const { privileges, redeemPrivilege, redemptions } = useContext(AppContext);
  
  const [selectedStall, setSelectedStall] = useState(() => {
    const active = privileges.filter(p => p.active);
    return active.length > 0 ? active[0].name : '';
  });

  const [attendeeCode, setAttendeeCode] = useState('');
  const [result, setResult] = useState(null); // { success: boolean, message: string, attendee?: object }

  const handleRedemptionSubmit = (e) => {
    e.preventDefault();
    if (!selectedStall || !attendeeCode.trim()) return;

    const res = redeemPrivilege(attendeeCode.trim(), selectedStall);
    setResult(res);
    setAttendeeCode('');
  };

  const handleScanQuickDemo = (code) => {
    setAttendeeCode(code);
  };

  // Filter redemptions for this counter
  const counterLogs = redemptions.filter(r => r.privilegeName === selectedStall);

  return (
    <div className="redemption-scanner-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Redemption Scanner</h2>
          <p>Simulate staff scanning and verifying attendee privileges at individual vendor counters.</p>
        </div>
      </div>

      <div className="scanner-grid">
        {/* Left Column: Camera Simulation & Input */}
        <div className="scanner-left">
          <div className="dashboard-card">
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Select Your Counter / Stall</label>
              <select 
                className="form-control"
                value={selectedStall}
                onChange={(e) => {
                  setSelectedStall(e.target.value);
                  setResult(null);
                }}
                style={{ fontSize: '15px', fontWeight: 600, borderLeft: '4px solid var(--accent-purple)' }}
              >
                {privileges.map(p => (
                  <option key={p.id} value={p.name} disabled={!p.active}>
                    {p.name} {p.active ? `(${p.location})` : '(INACTIVE)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Simulation Panel */}
            <div className="scanner-camera-sim">
              <div className="scanner-laser"></div>
              <Scan size={48} strokeWidth={1} color="rgba(255, 255, 255, 0.4)" />
              <div className="scanner-status-text">
                Counter: {selectedStall || 'None Selected'}
              </div>
            </div>

            {/* Input fields */}
            <form onSubmit={handleRedemptionSubmit} style={{ marginTop: '24px' }}>
              <div className="form-group">
                <label>Attendee Ticket Code</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. EPM-1002"
                    value={attendeeCode}
                    onChange={(e) => setAttendeeCode(e.target.value)}
                    style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn-primary">
                    Verify
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Demo Helper */}
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Quick Demo Shortcut Codes:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span onClick={() => handleScanQuickDemo('EPM-1002')} className="badge badge-premium" style={{ cursor: 'pointer' }}>EPM-1002 (Priya - Checked In)</span>
                <span onClick={() => handleScanQuickDemo('EPM-1003')} className="badge badge-standard" style={{ cursor: 'pointer' }}>EPM-1003 (Rohan - Checked In)</span>
                <span onClick={() => handleScanQuickDemo('EPM-1001')} className="badge badge-vip" style={{ cursor: 'pointer' }}>EPM-1001 (Aarav - Not Checked In)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scanning Status Result & Counter Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Result Block */}
          {result && (
            <div className="dashboard-card" style={{ 
              borderColor: result.success ? 'var(--accent-green)' : '#ff7675',
              borderWidth: '2px',
              animation: 'modal-fade 0.2s forwards'
            }}>
              <div className="checkin-result" style={{ background: 'transparent', margin: 0, padding: 0 }}>
                {result.success ? (
                  <>
                    <div className="checkin-status-icon success" style={{ width: '48px', height: '48px' }}>
                      <Check size={24} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Redemption Approved
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 12px' }}>
                      {result.attendee.name} ({result.attendee.company})
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge badge-${result.attendee.ticketType.toLowerCase()}`}>
                        {result.attendee.ticketType}
                      </span>
                      <span className="badge-user-code">{result.attendee.code}</span>
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--accent-green)', fontWeight: 700 }}>
                      Enjoy your {selectedStall}!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="checkin-status-icon error" style={{ width: '48px', height: '48px' }}>
                      <AlertTriangle size={24} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Access Denied
                    </div>
                    <div style={{ fontSize: '13px', color: '#ff7675', fontWeight: 700, margin: '8px 0 16px' }}>
                      {result.message}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Counter Logs */}
          <div className="dashboard-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="dashboard-card-title" style={{ margin: 0 }}>Counter Logs</div>
              <span className="badge badge-standard" style={{ marginLeft: 'auto' }}>
                {counterLogs.length} processed
              </span>
            </div>

            <div className="activity-list" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {counterLogs.map(log => (
                <div key={log.id} className="activity-item">
                  <div className="activity-details">
                    <div>
                      <div className="activity-title" style={{ fontSize: '13px' }}>
                        {log.attendeeName}
                      </div>
                      <div className="activity-time" style={{ fontSize: '10px' }}>
                        Ticket: {log.attendeeCode} &bull; {log.timestamp}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${log.status === 'success' ? 'badge-checked' : 'badge-not-checked'}`} style={{ fontSize: '10px' }}>
                    {log.status === 'success' ? 'Approved' : 'Failed'}
                  </span>
                </div>
              ))}
              {counterLogs.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                  No redemptions logged at this counter yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
