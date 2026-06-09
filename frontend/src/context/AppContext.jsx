import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const AppContext = createContext();

const DEFAULT_ATTENDEES = [
  { id: 1, name: 'Aarav Sharma', company: 'Acme Corp', email: 'aarav.sharma@example.com', phone: '+91 9800000000', ticketType: 'VIP', status: 'Not Checked In', code: 'EPM-1001', createdAt: 'Jun 8, 2026' },
  { id: 2, name: 'Priya Patel', company: 'Patel Industries', email: 'priya.patel@example.com', phone: '+91 9800013241', ticketType: 'Premium', status: 'Checked In', code: 'EPM-1002', createdAt: 'Jun 7, 2026' },
  { id: 3, name: 'Rohan Mehta', company: 'Mehta Group', email: 'rohan.mehta@example.com', phone: '+91 9800026482', ticketType: 'Standard', status: 'Checked In', code: 'EPM-1003', createdAt: 'Jun 6, 2026' },
  { id: 4, name: 'Sneha Iyer', company: 'Iyer Tech', email: 'sneha.iyer@example.com', phone: '+91 9800039723', ticketType: 'Premium', status: 'Not Checked In', code: 'EPM-1004', createdAt: 'Jun 5, 2026' },
  { id: 5, name: 'Vikram Singh', company: 'Singh Holdings', email: 'vikram.singh@example.com', phone: '+91 9800052964', ticketType: 'Standard', status: 'Checked In', code: 'EPM-1005', createdAt: 'Jun 4, 2026' },
  { id: 6, name: 'Ananya Gupta', company: 'Gupta & Co', email: 'ananya.gupta@example.com', phone: '+91 9800066205', ticketType: 'VIP', status: 'Checked In', code: 'EPM-1006', createdAt: 'Jun 3, 2026' },
  { id: 7, name: 'Karan Verma', company: 'Verma Solutions', email: 'karan.verma@example.com', phone: '+91 9800079446', ticketType: 'VIP', status: 'Not Checked In', code: 'EPM-1007', createdAt: 'Jun 2, 2026' },
  { id: 8, name: 'Meera Nair', company: 'Nair Studios', email: 'meera.nair@example.com', phone: '+91 9800092687', ticketType: 'Premium', status: 'Checked In', code: 'EPM-1008', createdAt: 'Jun 1, 2026' },
  { id: 9, name: 'Aditya Rao', company: 'Rao Logistics', email: 'aditya.rao@example.com', phone: '+91 9800105928', ticketType: 'Standard', status: 'Checked In', code: 'EPM-1009', createdAt: 'May 31, 2026' },
  { id: 10, name: 'Isha Kapoor', company: 'Kapoor Designs', email: 'isha.kapoor@example.com', phone: '+91 9800119169', ticketType: 'Standard', status: 'Not Checked In', code: 'EPM-1010', createdAt: 'May 30, 2026' }
];

const DEFAULT_TICKET_TYPES = [
  { id: 1, name: 'VIP', description: 'Full access to all privileges', color: '#6c5ce7', privileges: ['Tea Break', 'Lunch', 'Dinner', 'Gift Kit', 'Workshop Access', 'Lounge Access'] },
  { id: 2, name: 'Premium', description: 'Most privileges except VIP lounge', color: '#0284c7', privileges: ['Tea Break', 'Lunch', 'Dinner', 'Gift Kit', 'Workshop Access'] },
  { id: 3, name: 'Standard', description: 'Basic privileges', color: '#475569', privileges: ['Tea Break', 'Lunch', 'Gift Kit'] }
];

const DEFAULT_PRIVILEGES = [
  { id: 1, name: 'Tea Break', location: 'Tea Counter - Hall A - Lobby', time: '10:30 - 11:00', active: true },
  { id: 2, name: 'Lunch', location: 'Main Dining - Hall B', time: '13:00 - 14:30', active: true },
  { id: 3, name: 'Dinner', location: 'Grand Hall - Hall B', time: '19:30 - 21:00', active: true },
  { id: 4, name: 'Gift Kit', location: 'Gift Counter - Entrance', time: 'All Day', active: true },
  { id: 5, name: 'Workshop Access', location: 'Workshop Room - Hall C', time: '15:00 - 17:00', active: true },
  { id: 6, name: 'Lounge Access', location: 'VIP Lounge - 2nd Floor', time: 'All Day', active: true }
];

const DEFAULT_REDEMPTIONS = [
  { id: 1, attendeeName: 'Priya Patel', attendeeCode: 'EPM-1002', privilegeName: 'Tea Break', location: 'Tea Counter - Hall A - Lobby', timestamp: 'Jun 9, 2026 14:50', status: 'success' },
  { id: 2, attendeeName: 'Rohan Mehta', attendeeCode: 'EPM-1003', privilegeName: 'Lunch', location: 'Main Dining - Hall B', timestamp: 'Jun 9, 2026 13:10', status: 'success' },
  { id: 3, attendeeName: 'Vikram Singh', attendeeCode: 'EPM-1005', privilegeName: 'Gift Kit', location: 'Gift Counter - Entrance', timestamp: 'Jun 9, 2026 10:15', status: 'success' },
  { id: 4, attendeeName: 'Ananya Gupta', attendeeCode: 'EPM-1006', privilegeName: 'Tea Break', location: 'Tea Counter - Hall A - Lobby', timestamp: 'Jun 9, 2026 10:45', status: 'success' }
];

export const AppProvider = ({ children }) => {
  // Theme & Views state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication State
  // TODO(security): Token is cached in sessionStorage for reload resilience, in-memory for security
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // API Backend States
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState('');

  // Local/Sandbox Databases
  const [attendees, setAttendees] = useState(() => {
    const local = localStorage.getItem('attendees');
    return local ? JSON.parse(local) : DEFAULT_ATTENDEES;
  });

  const [ticketTypes, setTicketTypes] = useState(() => {
    const local = localStorage.getItem('ticketTypes');
    return local ? JSON.parse(local) : DEFAULT_TICKET_TYPES;
  });

  const [privileges, setPrivileges] = useState(() => {
    const local = localStorage.getItem('privileges');
    return local ? JSON.parse(local) : DEFAULT_PRIVILEGES;
  });

  const [redemptions, setRedemptions] = useState(() => {
    const local = localStorage.getItem('redemptions');
    return local ? JSON.parse(local) : DEFAULT_REDEMPTIONS;
  });

  // Syncing layout states
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  // Syncing Sandbox States
  useEffect(() => {
    localStorage.setItem('attendees', JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    localStorage.setItem('ticketTypes', JSON.stringify(ticketTypes));
  }, [ticketTypes]);

  useEffect(() => {
    localStorage.setItem('privileges', JSON.stringify(privileges));
  }, [privileges]);

  useEffect(() => {
    localStorage.setItem('redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  // Bootstrap Auth check
  useEffect(() => {
    const initAuth = async () => {
      const activeToken = sessionStorage.getItem('token');
      if (activeToken) {
        try {
          const profile = await api.getProfile();
          setUser(profile.data);
          // Auto load events
          loadBackendData();
        } catch (err) {
          console.error('Session validation failed', err);
          logoutUser();
        }
      }
      setAuthLoading(false);
    };
    initAuth();
  }, [token]);

  const loadBackendData = async () => {
    setBackendLoading(true);
    try {
      const allEventsData = await api.getEvents();
      setEvents(allEventsData.data || []);
      const myEventsData = await api.getMyEvents();
      setMyEvents(myEventsData.data || []);
    } catch (err) {
      setBackendError(err.message || 'Failed to sync backend data.');
    } finally {
      setBackendLoading(false);
    }
  };

  // Auth Operations
  const loginUser = async (email, password) => {
    setAuthLoading(true);
    setBackendError('');
    try {
      const res = await api.login(email, password);
      const userToken = res.data.token;
      sessionStorage.setItem('token', userToken);
      setToken(userToken);
      
      const profile = await api.getProfile();
      setUser(profile.data);
      
      // Load events list
      const eventsData = await api.getEvents();
      setEvents(eventsData.data || []);
      
      setActiveView('dashboard');
      return { success: true };
    } catch (err) {
      setBackendError(err.message);
      return { success: false, message: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const registerUser = async (name, email, password, role) => {
    setAuthLoading(true);
    setBackendError('');
    try {
      await api.register(name, email, password, role);
      // Auto login after sign up
      return await loginUser(email, password);
    } catch (err) {
      setBackendError(err.message);
      return { success: false, message: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutUser = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setEvents([]);
    setMyEvents([]);
    setActiveView('dashboard');
  };

  const syncUserProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile.data);
    } catch (err) {
      console.error('Failed to sync profile', err);
    }
  };

  // Backend Events operations
  const triggerCreateEvent = async (eventData) => {
    setBackendLoading(true);
    try {
      await api.createEvent(eventData);
      await loadBackendData();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setBackendLoading(false);
    }
  };

  const triggerUpdateEvent = async (id, eventData) => {
    setBackendLoading(true);
    try {
      await api.updateEvent(id, eventData);
      await loadBackendData();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setBackendLoading(false);
    }
  };

  const triggerDeleteEvent = async (id) => {
    setBackendLoading(true);
    try {
      await api.deleteEvent(id);
      await loadBackendData();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setBackendLoading(false);
    }
  };

  const triggerAttendEvent = async (id) => {
    setBackendLoading(true);
    try {
      await api.attendEvent(id);
      await loadBackendData();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setBackendLoading(false);
    }
  };

  // Sandbox Operations (EPM modules)
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addAttendee = (attendeeData) => {
    const lastId = attendees.reduce((max, a) => Math.max(max, a.id), 0);
    const newId = lastId + 1;
    const codeNumber = 1000 + newId;
    const newAttendee = {
      id: newId,
      name: attendeeData.name,
      company: attendeeData.company || 'Individual',
      email: attendeeData.email,
      phone: attendeeData.phone,
      ticketType: attendeeData.ticketType,
      status: 'Not Checked In',
      code: `EPM-${codeNumber}`,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setAttendees(prev => [newAttendee, ...prev]);
    return newAttendee;
  };

  const deleteAttendee = (id) => {
    setAttendees(prev => prev.filter(a => a.id !== id));
  };

  const checkInAttendee = (code) => {
    const cleanedCode = code.trim().toUpperCase();
    const attendeeIndex = attendees.findIndex(a => a.code.toUpperCase() === cleanedCode);

    if (attendeeIndex === -1) {
      return { success: false, message: 'Attendee code not found.' };
    }

    const attendee = attendees[attendeeIndex];

    if (attendee.status === 'Checked In') {
      return { success: false, message: `${attendee.name} is already checked in.`, attendee };
    }

    const updatedAttendees = [...attendees];
    updatedAttendees[attendeeIndex] = { ...attendee, status: 'Checked In' };
    setAttendees(updatedAttendees);

    return { success: true, message: `${attendee.name} checked in successfully!`, attendee };
  };

  const redeemPrivilege = (attendeeCode, privilegeName) => {
    const cleanedCode = attendeeCode.trim().toUpperCase();
    const attendee = attendees.find(a => a.code.toUpperCase() === cleanedCode);

    if (!attendee) {
      const failedRedemption = {
        id: Date.now(),
        attendeeName: 'Unknown Attendee',
        attendeeCode: cleanedCode,
        privilegeName,
        location: 'Unknown Location',
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false }),
        status: 'failed'
      };
      setRedemptions(prev => [failedRedemption, ...prev]);
      return { success: false, message: 'Invalid ticket / attendee code.' };
    }

    const priv = privileges.find(p => p.name === privilegeName);
    if (!priv) {
      return { success: false, message: 'Privilege not found.' };
    }
    if (!priv.active) {
      return { success: false, message: 'Privilege is currently inactive/disabled.' };
    }

    if (attendee.status !== 'Checked In') {
      return { success: false, message: `${attendee.name} is not checked in at the main gate.` };
    }

    const ticketConfig = ticketTypes.find(t => t.name === attendee.ticketType);
    if (!ticketConfig || !ticketConfig.privileges.includes(privilegeName)) {
      const failedRedemption = {
        id: Date.now(),
        attendeeName: attendee.name,
        attendeeCode: attendee.code,
        privilegeName,
        location: priv.location,
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false }),
        status: 'failed'
      };
      setRedemptions(prev => [failedRedemption, ...prev]);
      return { success: false, message: `Access Denied: Ticket tier [${attendee.ticketType}] does not have access to ${privilegeName}.` };
    }

    const alreadyRedeemed = redemptions.some(r => r.attendeeCode.toUpperCase() === cleanedCode && r.privilegeName === privilegeName && r.status === 'success');
    if (alreadyRedeemed) {
      const failedRedemption = {
        id: Date.now(),
        attendeeName: attendee.name,
        attendeeCode: attendee.code,
        privilegeName,
        location: priv.location,
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false }),
        status: 'failed'
      };
      setRedemptions(prev => [failedRedemption, ...prev]);
      return { success: false, message: `Already Redeemed: ${attendee.name} has already claimed ${privilegeName}.` };
    }

    const newRedemption = {
      id: Date.now(),
      attendeeName: attendee.name,
      attendeeCode: attendee.code,
      privilegeName,
      location: priv.location,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false }),
      status: 'success'
    };

    setRedemptions(prev => [newRedemption, ...prev]);
    return { success: true, message: `Redemption Approved: ${privilegeName} granted to ${attendee.name}!`, attendee };
  };

  const togglePrivilegeStatus = (name) => {
    setPrivileges(prev => prev.map(p => p.name === name ? { ...p, active: !p.active } : p));
  };

  const updateTicketPrivileges = (ticketName, updatedPrivileges) => {
    setTicketTypes(prev => prev.map(t => t.name === ticketName ? { ...t, privileges: updatedPrivileges } : t));
  };

  const addTicketType = (name, description, color, initialPrivs = []) => {
    const lastId = ticketTypes.reduce((max, t) => Math.max(max, t.id), 0);
    const newTicket = {
      id: lastId + 1,
      name,
      description,
      color,
      privileges: initialPrivs
    };
    setTicketTypes(prev => [...prev, newTicket]);
  };

  const addPrivilege = (name, location, time) => {
    const lastId = privileges.reduce((max, p) => Math.max(max, p.id), 0);
    const newPrivilege = {
      id: lastId + 1,
      name,
      location,
      time,
      active: true
    };
    setPrivileges(prev => [...prev, newPrivilege]);
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      activeView,
      setActiveView,
      searchQuery,
      setSearchQuery,
      // Auth States
      token,
      user,
      authLoading,
      loginUser,
      registerUser,
      logoutUser,
      syncUserProfile,
      // API Backend
      events,
      myEvents,
      backendLoading,
      backendError,
      loadBackendData,
      triggerCreateEvent,
      triggerUpdateEvent,
      triggerDeleteEvent,
      triggerAttendEvent,
      // Sandbox States
      attendees,
      ticketTypes,
      privileges,
      redemptions,
      addAttendee,
      deleteAttendee,
      checkInAttendee,
      redeemPrivilege,
      togglePrivilegeStatus,
      updateTicketPrivileges,
      addTicketType,
      addPrivilege
    }}>
      {children}
    </AppContext.Provider>
  );
};
