import React, { useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';

// Pages
import Dashboard from './pages/Dashboard';
import Attendees from './pages/Attendees';
import EntranceCheckIn from './pages/EntranceCheckIn';
import IDCards from './pages/IDCards';
import TicketTypes from './pages/TicketTypes';
import Privileges from './pages/Privileges';
import StallQrCodes from './pages/StallQrCodes';
import RedemptionScanner from './pages/RedemptionScanner';
import RedemptionReport from './pages/RedemptionReport';
import Settings from './pages/Settings';

// Icons
import {
  LayoutGrid,
  Users,
  ScanLine,
  CreditCard,
  Tag,
  Award,
  QrCode,
  Scan,
  FileText,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  Search
} from 'lucide-react';

function MainLayout() {
  const {
    activeView,
    setActiveView,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery
  } = useContext(AppContext);

  // Render view depending on active state
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'attendees':
        return <Attendees />;
      case 'check-in':
        return <EntranceCheckIn />;
      case 'id-cards':
        return <IDCards />;
      case 'tickets':
        return <TicketTypes />;
      case 'privileges':
        return <Privileges />;
      case 'stall-qr':
        return <StallQrCodes />;
      case 'scanner':
        return <RedemptionScanner />;
      case 'reports':
        return <RedemptionReport />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">E</div>
          <div className="logo-text">
            <h1>Event Privilege</h1>
            <span>Manager</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          <div 
            className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'attendees' ? 'active' : ''}`}
            onClick={() => setActiveView('attendees')}
          >
            <Users size={18} />
            <span>Attendees</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'check-in' ? 'active' : ''}`}
            onClick={() => setActiveView('check-in')}
          >
            <ScanLine size={18} />
            <span>Entrance Check-in</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'id-cards' ? 'active' : ''}`}
            onClick={() => setActiveView('id-cards')}
          >
            <CreditCard size={18} />
            <span>ID Cards</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Privilege</div>
          <div 
            className={`nav-link ${activeView === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveView('tickets')}
          >
            <Tag size={18} />
            <span>Ticket Types</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'privileges' ? 'active' : ''}`}
            onClick={() => setActiveView('privileges')}
          >
            <Award size={18} />
            <span>Privileges</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'stall-qr' ? 'active' : ''}`}
            onClick={() => setActiveView('stall-qr')}
          >
            <QrCode size={18} />
            <span>Stall QR Codes</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Redemption</div>
          <div 
            className={`nav-link ${activeView === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveView('scanner')}
          >
            <Scan size={18} />
            <span>Redemption Scanner</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveView('reports')}
          >
            <FileText size={18} />
            <span>Redemption Report</span>
          </div>
        </div>

        <div className="nav-section" style={{ marginTop: 'auto' }}>
          <div className="nav-section-title">System</div>
          <div 
            className={`nav-link ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header Row */}
        <header className="top-navbar">
          <div className="search-box">
            <Search />
            <input 
              type="text" 
              placeholder="Search attendees, privileges, stalls..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            {/* Theme Toggle Button */}
            <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon /> : <Sun />}
            </button>

            {/* Notification Icon */}
            <button className="icon-btn" onClick={() => alert('No new notifications')} title="Notifications">
              <Bell />
              <span className="badge-dot"></span>
            </button>

            {/* Profile widget */}
            <div className="user-profile-widget">
              <div className="avatar-badge">AD</div>
              <div className="user-profile-info">
                <span className="user-profile-name">Admin</span>
                <span className="user-profile-role">Organizer</span>
              </div>
            </div>
          </div>
        </header>

        {/* View render */}
        <main className="page-container">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
