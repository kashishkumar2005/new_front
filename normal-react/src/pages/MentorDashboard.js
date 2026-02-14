import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, Star, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

function MentorDashboard() {
  const [mentorId] = useState(1); // In a real app, this would come from auth context
  const [mentorName] = useState('Dr. Aisha Khan'); // From auth context
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [sessionNotes, setSessionNotes] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Load bookings from localStorage
  useEffect(() => {
    const allBookings = JSON.parse(localStorage.getItem('skillpulse-bookings')) || [];
    // Filter bookings for this mentor
    const mentorBookings = allBookings.filter(b => b.mentorId === mentorId);
    setBookings(mentorBookings);

    // Load user reports
    const reports = JSON.parse(localStorage.getItem('skillpulse-userReports')) || [];
    setUserReports(reports);
  }, [mentorId]);

  const completedBookings = bookings.filter(b => new Date(b.iso) < new Date());
  const upcomingBookings = bookings.filter(b => new Date(b.iso) >= new Date()).sort((a, b) => new Date(a.iso) - new Date(b.iso));

  const getBookingReport = (bookingId) => {
    return userReports.find(r => r.bookingId === bookingId);
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const saveSessionNotes = (bookingId) => {
    const notes = sessionNotes[bookingId] || '';
    if (!notes.trim()) {
      alert('Please enter session notes');
      return;
    }

    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, sessionNotes: notes } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem('skillpulse-bookings', JSON.stringify(updatedBookings));
    
    setSessionNotes({ ...sessionNotes, [bookingId]: '' });
    alert('Session notes saved!');
  };

  return (
    <div className="page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={32} />
          Mentor Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Welcome, {mentorName}! Manage your sessions and view student reports.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ background: 'var(--card-background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{upcomingBookings.length}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Upcoming Sessions</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--card-background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{completedBookings.length}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Completed Sessions</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--card-background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{bookings.length}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Total Sessions</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--card-background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>4.9</div>
          <div style={{ color: 'var(--text-secondary)' }}>Your Rating ⭐</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Upcoming Sessions */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Calendar size={24} />
            <h2>Upcoming Sessions</h2>
          </div>

          {upcomingBookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingBookings.map(booking => (
                <div key={booking.id} style={{ 
                  padding: '1rem', 
                  background: 'var(--input-background)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>📚 Booking {booking.id}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        {new Date(booking.iso).toLocaleString()}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.25rem' }}>→</span>
                  </div>
                  
                  {booking.notes && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <strong>Notes:</strong> {booking.notes}
                    </div>
                  )}

                  {selectedBooking?.id === booking.id && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Add Session Notes</label>
                      <textarea 
                        value={sessionNotes[booking.id] || ''}
                        onChange={(e) => setSessionNotes({ ...sessionNotes, [booking.id]: e.target.value })}
                        placeholder="Add notes for this session..."
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border-color)',
                          minHeight: '80px',
                          fontFamily: 'inherit'
                        }}
                      />
                      <button 
                        className="btn btn-primary"
                        onClick={() => saveSessionNotes(booking.id)}
                        style={{ marginTop: '0.5rem' }}
                      >
                        Save Notes
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Calendar size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
              <p>No upcoming sessions scheduled</p>
            </div>
          )}
        </div>

        {/* Completed Sessions */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <CheckCircle size={24} />
            <h2>Completed Sessions</h2>
          </div>

          {completedBookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {completedBookings.slice().reverse().map(booking => (
                <div key={booking.id} style={{ 
                  padding: '1rem', 
                  background: 'var(--input-background)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>✅ Session Complete</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {new Date(booking.iso).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {booking.sessionNotes && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--background)', borderRadius: '4px' }}>
                      <strong>Notes:</strong> {booking.sessionNotes}
                    </div>
                  )}

                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      const report = getBookingReport(booking.id);
                      if (report) openReportModal(report);
                      else alert('No user report available for this session yet');
                    }}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <FileText size={16} />
                    View User Report
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckCircle size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
              <p>No completed sessions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* User Reports Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <FileText size={24} />
          <h2>Student Reports & Feedback</h2>
        </div>

        {userReports.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {userReports.map(report => (
              <div key={report.id} style={{ 
                padding: '1.5rem', 
                background: 'var(--input-background)', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>📋 Report</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < report.rating ? 'var(--primary)' : 'transparent'} color="var(--primary)" />
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <strong>Progress:</strong> {report.progress}
                </div>

                <div style={{ fontSize: '0.875rem', lineHeight: '1.4', marginBottom: '1rem', maxHeight: '80px', overflow: 'hidden' }}>
                  <strong>Feedback:</strong> {report.feedback}
                </div>

                <button 
                  className="btn btn-outline"
                  onClick={() => openReportModal(report)}
                  style={{ width: '100%' }}
                >
                  View Full Report
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
            <p>No student reports submitted yet</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>📋 Student Report</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Rating</label>
                <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < selectedReport.rating ? 'var(--primary)' : 'transparent'} color="var(--primary)" />
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Submitted</label>
                <div style={{ marginTop: '0.5rem' }}>{new Date(selectedReport.submittedAt).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Progress Made</label>
              <p style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--background)', borderRadius: '6px' }}>
                {selectedReport.progress}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Detailed Feedback</label>
              <p style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--background)', borderRadius: '6px', lineHeight: '1.6' }}>
                {selectedReport.feedback}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Learning Goals</label>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                {selectedReport.goals?.map((goal, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{goal}</li>
                ))}
              </ul>
            </div>

            <button className="btn btn-primary" onClick={closeReportModal} style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorDashboard;
