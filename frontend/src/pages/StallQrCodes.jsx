import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Printer, Download, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Scannable SVG QR code for Stalls using qrcode.react
function StallQrCode({ name }) {
  return (
    <QRCodeSVG 
      value={name} 
      size={130} 
      level="M" 
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default function StallQrCodes() {
  const { privileges } = useContext(AppContext);

  const handlePrintStall = (privilege, index) => {
    const svgElement = document.querySelectorAll('.badge-qr-container svg')[index];
    const svgString = svgElement ? new XMLSerializer().serializeToString(svgElement) : '';

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
            .qr-box { width: 250px; height: 250px; border: 1px solid #cbd5e1; border-radius: 16px; padding: 16px; margin: 0 auto 24px; background: white; display: flex; align-items: center; justify-content: center; }
            .qr-box svg { width: 100%; height: 100%; }
            .footer-text { font-size: 14px; color: #94a3b8; }
            .location { font-weight: bold; color: #0f172a; margin-top: 8px; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">${privilege.name}</div>
            <div class="subtitle">Privilege Redemption Stall</div>
            <div class="qr-box">
              ${svgString}
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

  const handleDownloadStall = (privilege, index) => {
    const svgElement = document.querySelectorAll('.badge-qr-container svg')[index];
    if (!svgElement) return;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${privilege.name.toLowerCase().replace(/\s+/g, '-')}-stall-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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
        {privileges.map((p, idx) => (
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
                onClick={() => handleDownloadStall(p, idx)}
                disabled={!p.active}
              >
                <Download size={14} /> Download
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handlePrintStall(p, idx)}
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
