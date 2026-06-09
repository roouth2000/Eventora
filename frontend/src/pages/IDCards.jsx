import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Printer, Eye, Download, X } from 'lucide-react';

// Offline-compatible SVG QR Code component that draws a realistic QR grid
function MiniQrCode({ value }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* Background */}
      <rect width="100%" height="100%" fill="white" />
      
      {/* Corner Finder Pattern Top-Left */}
      <rect x="5" y="5" width="25" height="25" fill="black" />
      <rect x="9" y="9" width="17" height="17" fill="white" />
      <rect x="13" y="13" width="9" height="9" fill="black" />
      
      {/* Corner Finder Pattern Top-Right */}
      <rect x="70" y="5" width="25" height="25" fill="black" />
      <rect x="74" y="9" width="17" height="17" fill="white" />
      <rect x="78" y="13" width="9" height="9" fill="black" />
      
      {/* Corner Finder Pattern Bottom-Left */}
      <rect x="5" y="70" width="25" height="25" fill="black" />
      <rect x="9" y="74" width="17" height="17" fill="white" />
      <rect x="13" y="78" width="9" height="9" fill="black" />
      
      {/* Alignment Pattern Bottom-Right */}
      <rect x="75" y="75" width="10" height="10" fill="black" />
      <rect x="77" y="77" width="6" height="6" fill="white" />
      <rect x="79" y="79" width="2" height="2" fill="black" />
      
      {/* Dummy Pixel Data based on string hashing to make each look unique */}
      {(() => {
        const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rects = [];
        for (let i = 0; i < 12; i++) {
          for (let j = 0; j < 12; j++) {
            // Avoid corner areas
            const inTopLeft = i < 4 && j < 4;
            const inTopRight = i < 4 && j > 7;
            const inBottomLeft = i > 7 && j < 4;
            const inBottomRight = i > 7 && j > 7;
            
            if (!inTopLeft && !inTopRight && !inBottomLeft && !inBottomRight) {
              const seed = (hash + (i * 13) + (j * 37)) % 100;
              if (seed > 40) { // ~60% density
                rects.push(
                  <rect 
                    key={`${i}-${j}`} 
                    x={35 + i * 3} 
                    y={35 + j * 3} 
                    width="2.5" 
                    height="2.5" 
                    fill="black" 
                  />
                );
              }
            }
          }
        }
        
        // Add random alignment blocks
        const blocks = [
          { x: 40, y: 10 }, { x: 55, y: 15 }, { x: 45, y: 25 },
          { x: 15, y: 45 }, { x: 20, y: 55 }, { x: 10, y: 60 },
          { x: 75, y: 40 }, { x: 85, y: 50 }, { x: 90, y: 65 }
        ];
        blocks.forEach((b, idx) => {
          const active = (hash + idx) % 2 === 0;
          if (active) {
            rects.push(
              <rect key={`block-${idx}`} x={b.x} y={b.y} width="4" height="4" fill="black" />
            );
          }
        });

        return rects;
      })()}
    </svg>
  );
}

export default function IDCards() {
  const { attendees, ticketTypes } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [previewAttendee, setPreviewAttendee] = useState(null);

  const getTicketColor = (ticketType) => {
    const config = ticketTypes.find(t => t.name === ticketType);
    return config ? config.color : '#475569';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filtered = attendees.filter(a => {
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
  });

  const handlePrintSingle = (attendee) => {
    // Basic single card print approach: set preview to active, trigger print.
    // In clean implementations, print CSS ignores everything except the active printable preview modal.
    setPreviewAttendee(attendee);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintVisible = () => {
    window.print();
  };

  return (
    <div className="id-cards-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>ID Cards</h2>
          <p>Generate, preview and print attendee badges with embedded QR codes.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => alert('Download requested for all badges')}>
            <Download size={16} /> Download All
          </button>
          <button className="btn btn-primary" onClick={handlePrintVisible}>
            <Printer size={16} /> Print Visible
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="controls-row">
        <div className="search-box" style={{ width: '100%' }}>
          <Search />
          <input 
            type="text" 
            placeholder="Search attendees..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of badges */}
      <div className="badge-grid">
        {filtered.map(a => (
          <div key={a.id} className="badge-card">
            <div className={`badge-card-header ${a.ticketType.toLowerCase()}`} style={{ backgroundColor: getTicketColor(a.ticketType) }}>
              <span>TechFest 2026</span>
              <span>{a.ticketType}</span>
            </div>
            <div className="badge-card-body">
              <div 
                className="badge-user-initials"
                style={{ backgroundColor: getTicketColor(a.ticketType) }}
              >
                {getInitials(a.name)}
              </div>
              <div className="badge-user-name">{a.name}</div>
              <div className="badge-user-company">{a.company}</div>
              
              <div className="badge-qr-container">
                <MiniQrCode value={a.code} />
              </div>
              
              <div className="badge-user-code">{a.code}</div>
            </div>
            <div className="badge-card-footer">
              <button className="btn btn-secondary" onClick={() => setPreviewAttendee(a)}>
                <Eye size={14} /> Preview
              </button>
              <button className="btn btn-primary" onClick={() => handlePrintSingle(a)}>
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            No attendee records found.
          </div>
        )}
      </div>

      {/* Large Preview Modal */}
      {previewAttendee && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px', padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifySelf: 'flex-end', position: 'absolute', right: '16px', top: '16px', zIndex: 10 }}>
              <button 
                className="icon-btn" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white' }}
                onClick={() => setPreviewAttendee(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Area */}
            <div id="printable-badge" className="badge-card" style={{ boxShadow: 'none', border: 'none', borderRadius: '0' }}>
              <div 
                className="badge-card-header" 
                style={{ 
                  backgroundColor: getTicketColor(previewAttendee.ticketType),
                  height: '60px',
                  padding: '0 24px',
                  fontSize: '14px'
                }}
              >
                <span>TechFest 2026</span>
                <span>{previewAttendee.ticketType}</span>
              </div>
              <div className="badge-card-body" style={{ padding: '36px 24px' }}>
                <div 
                  className="badge-user-initials"
                  style={{ 
                    backgroundColor: getTicketColor(previewAttendee.ticketType),
                    width: '80px',
                    height: '80px',
                    fontSize: '28px',
                    marginBottom: '16px'
                  }}
                >
                  {getInitials(previewAttendee.name)}
                </div>
                <div className="badge-user-name" style={{ fontSize: '22px' }}>{previewAttendee.name}</div>
                <div className="badge-user-company" style={{ fontSize: '15px', marginBottom: '24px' }}>{previewAttendee.company}</div>
                
                <div className="badge-qr-container" style={{ width: '160px', height: '160px', padding: '12px' }}>
                  <MiniQrCode value={previewAttendee.code} />
                </div>
                
                <div className="badge-user-code" style={{ fontSize: '14px', padding: '6px 14px' }}>{previewAttendee.code}</div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-primary)', display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPreviewAttendee(null)}>
                Close
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={() => {
                  window.print();
                }}
              >
                Print Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
