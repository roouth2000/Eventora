import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Printer, Download, MapPin } from 'lucide-react';

// Offline-compatible SVG QR code for Stalls
function StallQrCode({ name }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100%" height="100%" fill="white" />
      
      {/* Corner Finder Patterns */}
      <rect x="5" y="5" width="22" height="22" fill="#6c5ce7" />
      <rect x="9" y="9" width="14" height="14" fill="white" />
      <rect x="12" y="12" width="8" height="8" fill="#6c5ce7" />
      
      <rect x="73" y="5" width="22" height="22" fill="#6c5ce7" />
      <rect x="77" y="9" width="14" height="14" fill="white" />
      <rect x="80" y="12" width="8" height="8" fill="#6c5ce7" />
      
      <rect x="5" y="73" width="22" height="22" fill="#6c5ce7" />
      <rect x="9" y="77" width="14" height="14" fill="white" />
      <rect x="12" y="80" width="8" height="8" fill="#6c5ce7" />

      {/* Center Decorative Anchor */}
      <rect x="44" y="44" width="12" height="12" fill="#6c5ce7" />
      <circle cx="50" cy="50" r="3" fill="white" />
      
      {/* Dynamic Data Blocks */}
      {(() => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rects = [];
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            const inTopLeft = i < 3 && j < 3;
            const inTopRight = i < 3 && j > 6;
            const inBottomLeft = i > 6 && j < 3;
            const inCenter = i >= 4 && i <= 5 && j >= 4 && j <= 5;
            
            if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenter) {
              const seed = (hash + (i * 17) + (j * 43)) % 100;
              if (seed > 35) { // ~65% density
                rects.push(
                  <rect 
                    key={`${i}-${j}`} 
                    x={30 + i * 4} 
                    y={30 + j * 4} 
                    width="3" 
                    height="3" 
                    fill="#1e293b" 
                  />
                );
              }
            }
          }
        }
        return rects;
      })()}
    </svg>
  );
}

export default function StallQrCodes() {
  const { privileges } = useContext(AppContext);

  const handlePrintStall = (privilege) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Stall QR: ${privilege.name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; color: #1e293b; }
            .card { border: 2px solid #e2e8f0; border-radius: 24px; padding: 40px; max-width: 450px; margin: 0 auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .title { font-size: 32px; font-weight: 800; margin-bottom: 8px; color: #6c5ce7; }
            .subtitle { font-size: 18px; color: #64748b; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.05em; }
            .qr-box { width: 250px; height: 250px; border: 1px solid #cbd5e1; border-radius: 16px; padding: 16px; margin: 0 auto 24px; background: white; }
            .footer-text { font-size: 14px; color: #94a3b8; }
            .location { font-weight: bold; color: #0f172a; margin-top: 8px; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">${privilege.name}</div>
            <div class="subtitle">Privilege Redemption Stall</div>
            <div class="qr-box">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <rect width="100%" height="100%" fill="white" />
                <rect x="5" y="5" width="22" height="22" fill="#6c5ce7" />
                <rect x="9" y="9" width="14" height="14" fill="white" />
                <rect x="12" y="12" width="8" height="8" fill="#6c5ce7" />
                <rect x="73" y="5" width="22" height="22" fill="#6c5ce7" />
                <rect x="77" y="9" width="14" height="14" fill="white" />
                <rect x="80" y="12" width="8" height="8" fill="#6c5ce7" />
                <rect x="5" y="73" width="22" height="22" fill="#6c5ce7" />
                <rect x="9" y="77" width="14" height="14" fill="white" />
                <rect x="12" y="80" width="8" height="8" fill="#6c5ce7" />
                <rect x="44" y="44" width="12" height="12" fill="#6c5ce7" />
                <rect x="30" y="30" width="40" height="40" fill="#1e293b" />
              </svg>
            </div>
            <div>Stall Location:</div>
            <div class="location">${privilege.location}</div>
            <div class="footer-text" style="margin-top: 24px;">Scan this QR code using the Eventora staff terminal to redeem items.</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="stall-qr-container">
      <div className="page-header">
        <div className="page-title-area">
          <h2>Stall QR Codes</h2>
          <p>Download and print QR signs for each redemption booth/vendor counter.</p>
        </div>
      </div>

      <div className="badge-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {privileges.map(p => (
          <div key={p.id} className="badge-card" style={{ opacity: p.active ? 1 : 0.6 }}>
            <div className="badge-card-header" style={{ background: p.active ? 'var(--gradient-primary)' : '#94a3b8' }}>
              <span>Event Stall</span>
              <span>{p.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="badge-card-body">
              <div className="badge-user-name" style={{ fontSize: '16px', marginBottom: '4px' }}>{p.name}</div>
              <div className="badge-user-company" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginBottom: '16px' }}>
                <MapPin size={12} /> {p.location}
              </div>

              <div className="badge-qr-container" style={{ width: '130px', height: '130px', padding: '8px' }}>
                <StallQrCode name={p.name} />
              </div>

              <div className="badge-user-code" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                {p.time}
              </div>
            </div>
            <div className="badge-card-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => alert(`Stall configuration for ${p.name} downloaded.`)}
                disabled={!p.active}
              >
                <Download size={14} /> Download
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handlePrintStall(p)}
                disabled={!p.active}
              >
                <Printer size={14} /> Print Sign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
