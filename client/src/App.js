import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeluguCalendar from './TeluguCalendar';
import IslamicCalendar from './IslamicCalendar';
import IndianCalendar from './IndianCalendar';

// --- Minimal SVG Icons ---
const CalendarIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>);
const ChartPieIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>);
const PlusIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>);
const XIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>);
const EditIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>);
const ChevronLeftIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>);
const ChevronRightIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>);
const LogOutIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>);
const UserIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>);

// ----- Sub-Components ----- //

const AuthPage = ({ authView, setAuthView, handleAuth, loading }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4 overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -ml-20 -mb-20"></div>
    
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md relative z-10 border border-slate-100">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 mb-4">
          <CalendarIcon />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">SchedulerBase</h1>
        <p className="text-slate-500 text-sm mt-1">{authView === 'login' ? 'Welcome back! Please login.' : 'Create your professional account.'}</p>
      </div>

      <form onSubmit={(e) => handleAuth(e, authView)} className="space-y-4">
        {authView === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input name="name" type="text" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="John Doe" required />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input name="email" type="email" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="john@example.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input name="password" type="password" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="••••••••" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 mt-2">
          {loading ? 'Processing...' : authView === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          {authView === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setAuthView(authView === 'login' ? 'signup' : 'login')} className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
            {authView === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  </div>
);

const EventModal = ({ showForm, editing, formData, setFormData, handleSubmit, closeModal }) => {
  if (!showForm) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all border border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-slate-800">{editing ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 outline-none transition-colors"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
              <input className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" type="text" placeholder="E.g., Team Standup" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" type="datetime-local" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                <input className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" type="datetime-local" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
              <textarea className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24" placeholder="Add event details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-lg transition-all">{editing ? 'Update Event' : 'Save Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', start_time: '', end_time: '' });
  const [view, setView] = useState('dashboard');
  const [calendarMode, setCalendarMode] = useState('english');
  const [loading, setLoading] = useState(false);
  const [authView, setAuthView] = useState('login'); // login or signup

  const api = React.useMemo(() => axios.create({
    baseURL: '/api',
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  }), [token]);

  const fetchEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token, fetchEvents]);

  const handleAuth = async (e, type) => {
    e.preventDefault();
    const { email, password, name } = e.target.elements;
    try {
      setLoading(true);
      if (type === 'signup') {
        await axios.post('/api/auth/signup', { email: email.value, password: password.value, name: name?.value });
        alert('Account created! Please log in.');
        setAuthView('login');
      } else {
        const res = await axios.post('/api/auth/login', { email: email.value, password: password.value });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setEvents([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/events/${editing}`, formData);
      } else {
        await api.post('/events', formData);
      }
      fetchEvents();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.error || 'An error occurred while saving.');
    }
  };

  const handleEdit = (event) => {
    setEditing(event.id);
    setFormData({ 
      title: event.title, 
      description: event.description, 
      start_time: event.start_time.slice(0,16), 
      end_time: event.end_time.slice(0,16) 
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditing(null);
    setFormData({ title: '', description: '', start_time: '', end_time: '' });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="bg-slate-50 border-r border-b border-slate-100 h-32 opacity-50"></div>);
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.start_time.startsWith(dateStr));
      const isToday = dateStr === todayStr;

      days.push(
        <div key={day} className={`border-r border-b border-slate-100 h-32 p-1.5 transition-colors hover:bg-slate-50/50 group flex flex-col ${isToday ? 'bg-indigo-50/20' : ''}`}>
          <div className="flex justify-between items-start mb-1">
            <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}>{day}</span>
          </div>
          <div className="flex-1 overflow-y-auto hide-scroll space-y-1">
            {dayEvents.map(event => (
              <div key={event.id} onClick={() => handleEdit(event)} className="group/item cursor-pointer text-[10px] md:text-xs p-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100/50 transition-colors flex justify-between items-center relative">
                <span className="truncate font-medium w-full">{event.title}</span>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }} className="opacity-0 group-hover/item:opacity-100 absolute right-1 text-indigo-400 hover:text-red-500 transition-opacity p-0.5"><TrashIcon /></button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 gap-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <CalendarIcon /> {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm transition-colors">Today</button>
            <div className="flex items-center rounded-md border border-slate-200 shadow-sm bg-white overflow-hidden">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors border-r border-slate-200"><ChevronLeftIcon /></button>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"><ChevronRightIcon /></button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2.5 text-center text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (loading && events.length === 0) return <div className="p-20 text-center text-slate-400 animate-pulse">Loading Workspace...</div>;
    
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const totalEvents = events.length;
    const eventsToday = events.filter(e => e.start_time.startsWith(todayStr)).length;
    const upcomingEvents = events.filter(e => new Date(e.start_time) > now).sort((a,b) => new Date(a.start_time) - new Date(b.start_time));
    const pastEvents = events.filter(e => new Date(e.end_time) < now);

    return (
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', val: totalEvents, bg: 'indigo' },
            { label: 'Today', val: eventsToday, bg: 'emerald' },
            { label: 'Upcoming', val: upcomingEvents.length, bg: 'blue' },
            { label: 'Archived', val: pastEvents.length, bg: 'slate' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${stat.bg}-50 rounded-full group-hover:bg-${stat.bg}-100 transition-colors`}></div>
              <span className="text-xs font-semibold text-slate-400 relative z-10 uppercase tracking-tighter">{stat.label}</span>
              <span className="text-3xl font-bold text-slate-800 mt-2 block relative z-10 tracking-tight">{stat.val}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
            <PlusIcon className="text-indigo-600" /> Recent Schedule
          </h3>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map(event => (
              <div key={event.id} className="group p-4 rounded-xl border border-slate-100 hover:border-indigo-100 bg-white hover:bg-slate-50/50 flex justify-between items-center transition-all">
                <div className="flex gap-4 items-center">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl"><CalendarIcon /></div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{event.title}</h4>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">
                        {new Date(event.start_time).toLocaleString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleEdit(event)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent shadow-sm hover:border-slate-100"><EditIcon /></button>
                   <button onClick={() => handleDelete(event.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent shadow-sm hover:border-slate-100"><TrashIcon /></button>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="text-sm">Enjoy your day! No upcoming tasks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!token) return <AuthPage authView={authView} setAuthView={setAuthView} handleAuth={handleAuth} loading={loading} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12 selection:bg-indigo-100 selection:text-indigo-900 transition-all">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shadow-slate-200/20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 text-indigo-600">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
                <CalendarIcon />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">SchedulerBase</span>
            </div>
            {calendarMode === 'english' && (
              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 ml-4 hidden md:flex">
                <button onClick={() => setView('dashboard')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold transition-all ${view === 'dashboard' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                  <ChartPieIcon /> <span className="hidden lg:inline">Analytics</span>
                </button>
                <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold transition-all ${view === 'calendar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                  <CalendarIcon /> <span className="hidden lg:inline">Calendar</span>
                </button>
              </div>
            )}
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 ml-2 md:ml-4 overflow-x-auto hide-scroll">
              <button onClick={() => setCalendarMode('english')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap ${calendarMode === 'english' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                🗓 <span className="hidden sm:inline">English</span>
              </button>
              <button onClick={() => setCalendarMode('islamic')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap ${calendarMode === 'islamic' ? 'bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200/50' : 'text-slate-500 hover:text-emerald-700'}`}>
                ☪ <span className="hidden sm:inline">Islamic</span>
              </button>
              <button onClick={() => setCalendarMode('telugu')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap ${calendarMode === 'telugu' ? 'bg-orange-100 text-orange-800 shadow-sm border border-orange-200/50' : 'text-slate-500 hover:text-orange-700'}`}>
                🪔 <span className="hidden sm:inline">Telugu</span>
              </button>
              <button onClick={() => setCalendarMode('indian')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap ${calendarMode === 'indian' ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200/50' : 'text-slate-500 hover:text-blue-700'}`}>
                🇮🇳 <span className="hidden sm:inline">Indian</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 md:px-4 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all text-xs md:text-sm whitespace-nowrap">
              <PlusIcon /> Create
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="hidden lg:flex items-center gap-3 mr-4">
                <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                    <UserIcon />
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-bold text-slate-800">{user?.name || 'User'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{user?.email}</span>
                </div>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Sign Out">
                 <LogOutIcon />
            </button>
          </div>
        </div>
      </nav>

      <EventModal 
        showForm={showForm} 
        editing={editing} 
        formData={formData} 
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        closeModal={closeModal}
      />

      <main className="max-w-6xl mx-auto px-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {calendarMode === 'telugu' && <TeluguCalendar />}
        {calendarMode === 'islamic' && <IslamicCalendar />}
        {calendarMode === 'indian' && <IndianCalendar />}
        {calendarMode === 'english' && (view === 'calendar' ? renderCalendar() : renderDashboard())}
      </main>
    </div>
  );
}

export default App;
