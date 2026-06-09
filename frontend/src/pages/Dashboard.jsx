import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, CheckCircle, Award, RefreshCw, PlusCircle, ScanLine, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const {
    attendees,
    ticketTypes,
    privileges,
    redemptions,
    setActiveView
  } = useContext(AppContext);

  // KPI Calculations
  const totalAttendees = attendees.length;
  const checkedInAttendees = attendees.filter(a => a.status === 'Checked In').length;
  const checkInRate = totalAttendees > 0 ? Math.round((checkedInAttendees / totalAttendees) * 100) : 0;
  
  const activePrivilegesCount = privileges.filter(p => p.active).length;
  const totalPrivilegesCount = privileges.length;

  const successfulRedemptions = redemptions.filter(r => r.status === 'success');
  const redemptionsCount = successfulRedemptions.length;

  // Donut SVG parameters
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (checkInRate / 100) * circumference;

  // Privilege Usage calculation
  const getRedemptionsForPrivilege = (privName) => {
    return successfulRedemptions.filter(r => r.privilegeName === privName).length;
  };

  // Find max redemptions for dynamic progress bar scaling
  const maxRedemptions = Math.max(...privileges.map(p => getRedemptionsForPrivilege(p.name)), 1);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Dashboard</h2>
          <p>Real-time overview of your event check-ins and privilege redemptions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveView('check-in')}>
          <ScanLine size={16} /> Open Check-in
        </button>
      </div>

      {/* KPI Grid */}
      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="kpi-info">
            <h3>Total Attendees</h3>
            <div className="kpi-value">{totalAttendees}</div>
            <div className="kpi-subtext">{totalAttendees} pre-registered</div>
          </div>
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
            <Users />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h3>Checked In</h3>
            <div className="kpi-value">{checkedInAttendees}</div>
            <div className="kpi-subtext">{checkInRate}% of total</div>
          </div>
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--accent-green)' }}>
            <CheckCircle />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h3>Active Privileges</h3>
            <div className="kpi-value">{activePrivilegesCount}</div>
            <div className="kpi-subtext">{totalPrivilegesCount} configured</div>
          </div>
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
            <Award />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <h3>Redemptions Today</h3>
            <div className="kpi-value">{redemptionsCount}</div>
            <div className="kpi-subtext">Across all stalls</div>
          </div>
          <div className="kpi-icon-container" style={{ backgroundColor: 'var(--accent-orange-light)', color: 'var(--accent-orange)' }}>
            <RefreshCw />
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="dashboard-row-2">
        {/* Privilege Usage */}
        <div className="dashboard-card">
          <div className="dashboard-card-title">Privilege Usage</div>
          <div className="dashboard-card-subtitle">Successful redemptions per privilege</div>
          
          <div className="privilege-usage-list">
            {privileges.map(p => {
              const count = getRedemptionsForPrivilege(p.name);
              const progressPercentage = (count / maxRedemptions) * 100;
              return (
                <div key={p.id} className="privilege-usage-item">
                  <div className="privilege-usage-label">
                    <span className="privilege-name">{p.name}</span>
                    <span className="privilege-count">{count} redemption{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${progressPercentage}%`,
                        background: p.active ? 'var(--gradient-primary)' : '#94a3b8'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Check-in Progress Circular Chart & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="dashboard-card">
            <div className="dashboard-card-title" style={{ textAlign: 'center' }}>Check-in Progress</div>
            <div className="dashboard-card-subtitle" style={{ textAlign: 'center' }}>{checkedInAttendees} of {totalAttendees} attendees arrived</div>
            
            <div className="circular-progress-container">
              <div className="donut-chart">
                <svg width="140" height="140" className="donut-svg">
                  <circle className="donut-hole" cx="70" cy="70" r={radius}></circle>
                  <circle className="donut-ring" cx="70" cy="70" r={radius} fill="transparent" strokeWidth="10"></circle>
                  <circle 
                    className="donut-segment" 
                    cx="70" 
                    cy="70" 
                    r={radius} 
                    fill="transparent" 
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  ></circle>
                </svg>
                <div className="donut-center-text">
                  <div className="donut-percentage">{checkInRate}%</div>
                  <div className="donut-label">Arrival rate</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-title">Quick Actions</div>
            
            <div className="quick-actions-list">
              <div className="quick-action-card" onClick={() => {
                setActiveView('attendees');
                // Open add modal custom state logic can be stored globally or triggered
                setTimeout(() => {
                  const event = new CustomEvent('open-add-attendee-modal');
                  window.dispatchEvent(event);
                }, 100);
              }}>
                <div className="quick-action-info">
                  <div className="quick-action-icon">
                    <PlusCircle size={18} />
                  </div>
                  <div>
                    <div className="quick-action-text">Add Attendee</div>
                    <div className="quick-action-desc">Register a new attendee</div>
                  </div>
                </div>
                <ArrowRight size={14} color="var(--text-secondary)" />
              </div>

              <div className="quick-action-card" onClick={() => setActiveView('scanner')}>
                <div className="quick-action-info">
                  <div className="quick-action-icon" style={{ backgroundColor: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
                    <ScanLine size={18} />
                  </div>
                  <div>
                    <div className="quick-action-text">Privilege Scanner</div>
                    <div className="quick-action-desc">Scan QR to redeem privileges</div>
                  </div>
                </div>
                <ArrowRight size={14} color="var(--text-secondary)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 - Recent Activity */}
      <div className="dashboard-card">
        <div className="dashboard-card-title">Recent Activity</div>
        <div className="dashboard-card-subtitle">Real-time log of privilege claims and gate check-ins</div>

        <div className="activity-list">
          {redemptions.slice(0, 5).map(r => (
            <div key={r.id} className="activity-item">
              <div className="activity-details">
                <div className="activity-icon" style={{ 
                  backgroundColor: r.status === 'success' ? 'var(--accent-green-light)' : 'rgba(255, 118, 117, 0.12)',
                  color: r.status === 'success' ? 'var(--accent-green)' : '#ff7675'
                }}>
                  <Award size={18} />
                </div>
                <div>
                  <div className="activity-title">
                    <strong>{r.attendeeName}</strong> &mdash; {r.privilegeName}
                  </div>
                  <div className="activity-time">{r.location} &bull; {r.timestamp}</div>
                </div>
              </div>
              <div className={r.status === 'success' ? 'activity-status-success' : 'activity-status-failed'}>
                {r.status === 'success' ? 'Success' : 'Failed'}
              </div>
            </div>
          ))}
          {redemptions.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '12px' }}>
              No redemption activities logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
