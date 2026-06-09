import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, FileText, Download } from 'lucide-react';

export default function RedemptionReport() {
  const { redemptions, privileges } = useContext(AppContext);

  const [selectedStall, setSelectedStall] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = redemptions.filter(r => {
    const matchesStall = selectedStall === 'all' || r.privilegeName === selectedStall;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesSearch = 
      r.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.attendeeCode.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());

    return matchesStall && matchesStatus && matchesSearch;
  });

  return (
    <div className="redemption-report-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Redemption Report</h2>
          <p>Review comprehensive historical records of all privilege redemption attempts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('Report exported as CSV')}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="controls-row">
        <div className="search-box" style={{ width: '300px' }}>
          <Search />
          <input 
            type="text" 
            placeholder="Search by attendee name or ticket..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            className="custom-select"
            value={selectedStall}
            onChange={(e) => setSelectedStall(e.target.value)}
          >
            <option value="all">All Counter Stalls</option>
            {privileges.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <select 
            className="custom-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success</option>
            <option value="failed">Failed / Access Denied</option>
          </select>
        </div>
      </div>

      {/* Report Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Attendee</th>
              <th>Ticket Code</th>
              <th>Stall Privilege</th>
              <th>Counter Location</th>
              <th>Timestamp</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.attendeeName}</td>
                <td>
                  <span className="badge-user-code">{r.attendeeCode}</span>
                </td>
                <td style={{ fontWeight: 500 }}>{r.privilegeName}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.location}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{r.timestamp}</td>
                <td>
                  <span className={`badge ${r.status === 'success' ? 'badge-checked' : 'badge-not-checked'}`} style={{
                    backgroundColor: r.status === 'success' ? '' : 'rgba(255, 118, 117, 0.12)',
                    color: r.status === 'success' ? '' : '#ff7675'
                  }}>
                    {r.status === 'success' ? 'Approved' : 'Denied'}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No redemption logs found matching search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
