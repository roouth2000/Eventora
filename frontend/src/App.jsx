import React, { useContext, useState } from 'react';
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
import Auth from './pages/Auth';
import EventPortal from './pages/EventPortal';
import Profile from './pages/Profile';

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
  Search,
  Globe,
  User,
  LogIn,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Menu
} from 'lucide-react';

function MainLayout() {
  const {
    activeView,
    setActiveView,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    token,
    user,
    logoutUser,
    toast,
    setToast
  } = useContext(AppContext);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const changeView = (view) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  // Render view depending on active state
  const renderView = () => {
    // Protected views mapping: redirect to Auth if no token
    if (!token && (activeView === 'profile')) {
      return <Auth />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'event-portal':
        return <EventPortal />;
      case 'profile':
        return <Profile />;
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
      case 'auth':
        return <Auth />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />}
          {toast.type === 'error' && <AlertCircle size={18} style={{ color: '#ff7675' }} />}
          {toast.type === 'warning' && <AlertCircle size={18} style={{ color: 'var(--accent-orange)' }} />}
          {toast.type === 'info' && <Info size={18} style={{ color: 'var(--accent-purple)' }} />}
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}
      {/* Sidebar Overlay for Mobile backdrop clicks */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-icon">E</div>
            <div className="logo-text">
              <h1>Eventora</h1>
              <span>EPM Console</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} title="Close Menu">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          <div 
            className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => changeView('dashboard')}
          >
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'event-portal' ? 'active' : ''}`}
            onClick={() => changeView('event-portal')}
          >
            <Globe size={18} />
            <span>Event Portal</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'attendees' ? 'active' : ''}`}
            onClick={() => changeView('attendees')}
          >
            <Users size={18} />
            <span>Attendees</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'check-in' ? 'active' : ''}`}
            onClick={() => changeView('check-in')}
          >
            <ScanLine size={18} />
            <span>Entrance Check-in</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'id-cards' ? 'active' : ''}`}
            onClick={() => changeView('id-cards')}
          >
            <CreditCard size={18} />
            <span>ID Cards</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Privilege</div>
          <div 
            className={`nav-link ${activeView === 'tickets' ? 'active' : ''}`}
            onClick={() => changeView('tickets')}
          >
            <Tag size={18} />
            <span>Ticket Types</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'privileges' ? 'active' : ''}`}
            onClick={() => changeView('privileges')}
          >
            <Award size={18} />
            <span>Privileges</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'stall-qr' ? 'active' : ''}`}
            onClick={() => changeView('stall-qr')}
          >
            <QrCode size={18} />
            <span>Stall QR Codes</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Redemption</div>
          <div 
            className={`nav-link ${activeView === 'scanner' ? 'active' : ''}`}
            onClick={() => changeView('scanner')}
          >
            <Scan size={18} />
            <span>Redemption Scanner</span>
          </div>
          <div 
            className={`nav-link ${activeView === 'reports' ? 'active' : ''}`}
            onClick={() => changeView('reports')}
          >
            <FileText size={18} />
            <span>Redemption Report</span>
          </div>
        </div>

        <div className="nav-section" style={{ marginTop: 'auto' }}>
          <div className="nav-section-title">System</div>
          {token ? (
            <div 
              className={`nav-link ${activeView === 'profile' ? 'active' : ''}`}
              onClick={() => changeView('profile')}
            >
              <User size={18} />
              <span>My Profile</span>
            </div>
          ) : (
            <div 
              className={`nav-link ${activeView === 'auth' ? 'active' : ''}`}
              onClick={() => changeView('auth')}
            >
              <LogIn size={18} />
              <span>Login / Sign Up</span>
            </div>
          )}
          <div 
            className={`nav-link ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => changeView('settings')}
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
          <button className="mobile-toggle-btn" onClick={() => setIsSidebarOpen(true)} title="Open Menu">
            <Menu size={20} />
          </button>

          <div className="search-box">
            <Search />
            <input 
              type="text" 
              placeholder="Search..." 
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
            {token && user ? (
              <div 
                className="user-profile-widget" 
                onClick={() => setActiveView('profile')}
                style={{ cursor: 'pointer' }}
                title="View Profile"
              >
                <div className="avatar-badge">
                  {user.name ? user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
                </div>
                <div className="user-profile-info">
                  <span className="user-profile-name">{user.name}</span>
                  <span className="user-profile-role" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                </div>
              </div>
            ) : (
              <div 
                className="user-profile-widget" 
                onClick={() => setActiveView('auth')}
                style={{ cursor: 'pointer' }}
                title="Login"
              >
                <div className="avatar-badge" style={{ backgroundColor: 'var(--text-secondary)' }}>?</div>
                <div className="user-profile-info">
                  <span className="user-profile-name">Guest Mode</span>
                  <span className="user-profile-role">Click to log in</span>
                </div>
              </div>
            )}
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
