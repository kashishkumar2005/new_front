import React, { useState, useEffect } from 'react';
import { FileText, Star, Send } from 'lucide-react';
import { createReport, getReports } from '../api/reports';

function StudentReport({ completedBookings, onReportSubmitted }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [progress, setProgress] = useState('');
  const [feedback, setFeedback] = useState('');
  const [goals, setGoals] = useState(['', '', '']);
  const [submittedReports, setSubmittedReports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('skillpulse-userReports')) || [];
    } catch {
      return [];
    }
  });

  // Fetch reports from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        const { reports } = await getReports();
        if (reports && Array.isArray(reports)) {
          setSubmittedReports(reports);
          localStorage.setItem('skillpulse-userReports', JSON.stringify(reports));
        }
      } catch (err) {
        console.warn('Could not fetch reports from backend', err.message);
      }
    })();
  }, []);

  const handleGoalChange = (index, value) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const submitReport = async () => {
    if (!selectedBooking) {
      alert('Please select a session');
      return;
    }
    if (!progress.trim() || !feedback.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const payload = {
      bookingId: selectedBooking._id || selectedBooking.id,
      mentorName: selectedBooking.mentorName,
      sessionDate: selectedBooking.date || new Date(selectedBooking.iso).toLocaleDateString(),
      rating: parseInt(rating),
      helpfulness: parseInt(rating),
      clarity: parseInt(rating),
      wouldRecommend: rating >= 4,
      feedback: `Progress: ${progress}\n\nFeedback: ${feedback}${goals.filter(g => g.trim()).length > 0 ? '\n\nGoals: ' + goals.filter(g => g.trim()).join(', ') : ''}`
    };

    try {
      const created = await createReport(payload);
      const newReport = created.report || created;
      const newReports = [...submittedReports, newReport];
      setSubmittedReports(newReports);
      localStorage.setItem('skillpulse-userReports', JSON.stringify(newReports));

      // Reset form
      setSelectedBooking(null);
      setRating(5);
      setProgress('');
      setFeedback('');
      setGoals(['', '', '']);

      alert('Report submitted! Thank you for the feedback.');
      if (onReportSubmitted) onReportSubmitted();
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    }
  };

  const isReportSubmitted = (bookingId) => {
    // Check if a report exists for this booking
    return submittedReports.some(r => r.bookingId === bookingId || (r._id && bookingId === r.bookingId));
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <FileText size={24} />
        <h2>Post-Session Feedback</h2>
      </div>

      {completedBookings.length > 0 ? (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.75rem' }}>
              Select a Session to Review
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {completedBookings.map(booking => (
                <button
                  key={booking.id}
                  onClick={() => !isReportSubmitted(booking.id) && setSelectedBooking(booking)}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: selectedBooking?.id === booking.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isReportSubmitted(booking.id) ? 'var(--background)' : 'var(--input-background)',
                    cursor: isReportSubmitted(booking.id) ? 'not-allowed' : 'pointer',
                    opacity: isReportSubmitted(booking.id) ? 0.5 : 1,
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  disabled={isReportSubmitted(booking.id)}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {booking.mentorName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(booking.iso).toLocaleDateString()}
                  </div>
                  {isReportSubmitted(booking.id) && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--success)' }}>
                      ✓ Report Submitted
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedBooking && (
            <div style={{ padding: '1.5rem', background: 'var(--input-background)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                  Rate Your Session (1-5 stars)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star
                        size={32}
                        fill={star <= rating ? 'var(--primary)' : 'transparent'}
                        color="var(--primary)"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  What progress did you make?
                </label>
                <textarea
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="Describe the progress or improvements you achieved from this session..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    background: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Detailed Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts about the session, mentor's approach, and areas for improvement..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    background: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Learning Goals for Next Session (optional)
                </label>
                {goals.map((goal, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={goal}
                    onChange={(e) => handleGoalChange(idx, e.target.value)}
                    placeholder={`Goal ${idx + 1}...`}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      marginBottom: '0.5rem',
                      background: 'var(--background)',
                      color: 'var(--text-primary)'
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={submitReport}
                  style={{ flex: 1 }}
                >
                  <Send size={16} />
                  Submit Report
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedBooking(null);
                    setRating(5);
                    setProgress('');
                    setFeedback('');
                    setGoals(['', '', '']);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FileText size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
          <p>No completed sessions to review yet</p>
        </div>
      )}
    </div>
  );
}

export default StudentReport;
