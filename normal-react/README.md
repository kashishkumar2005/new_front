# Mentoring Dashboard Feature Guide

## Overview
A complete mentoring system has been added to SkillPulse with two main components:
1. **Mentor Dashboard** - For mentors to manage sessions and view student reports
2. **Student Report System** - For students to submit feedback after sessions

---

## New Files Created

### 1. **MentorDashboard.js** (`src/pages/MentorDashboard.js`)
The mentor dashboard provides mentors with:
- **Dashboard Stats**: View upcoming sessions, completed sessions, total sessions, and ratings
- **Upcoming Sessions**: See all future mentoring sessions with booking details
- **Completed Sessions**: View past sessions with the ability to add session notes
- **Student Reports**: Browse and view detailed reports submitted by students
- **Report Modal**: View full student feedback including ratings, progress, and learning goals

**Key Features:**
- Filters bookings by mentor ID (currently hardcoded to mentor 1)
- Add and save session notes for completed sessions
- View star ratings and detailed feedback from students
- Track student learning goals

---

### 2. **StudentReport.js** (`src/pages/StudentReport.js`)
The student report form allows students to submit feedback after sessions:
- **Session Selection**: Choose from completed mentoring sessions
- **Star Rating**: Rate the session from 1-5 stars
- **Progress Report**: Describe progress made during the session
- **Detailed Feedback**: Share thoughts about the mentor and session quality
- **Learning Goals**: Set up to 3 learning goals for the next session
- **Report History**: View all previously submitted reports

**Key Features:**
- Only shows completed sessions (past the scheduled time)
- Prevents duplicate reports for the same session
- Beautiful star rating interface
- Goal tracking for continuous improvement

---

## Updated Files

### **App.js** (`src/App.js`)
Changes made:
1. **Imports**: Added MentorDashboard and StudentReport components, added BarChart2 icon
2. **Navigation**: Added two new nav pills:
   - "My Reports" button - navigates to student report view
   - "Mentor Hub" button - navigates to mentor dashboard view
3. **Views**: Added two new conditional render blocks:
   - `{view === 'studentreport' && <StudentReport ... />}`
   - `{view === 'mentordash' && <MentorDashboard />}`

---

## How It Works

### For Students:
1. Book a mentoring session (existing functionality)
2. After the session time has passed, go to "My Reports" tab
3. Select the completed session
4. Rate the session (1-5 stars)
5. Fill in your progress and feedback
6. Set learning goals for the next session
7. Submit the report

### For Mentors:
1. View "Mentor Hub" to see all sessions
2. **Upcoming Sessions**: See future bookings, add session notes
3. **Completed Sessions**: View past sessions with student feedback
4. Click "View User Report" to see detailed student reports
5. Review ratings, progress, feedback, and goals

---

## Data Storage

All data is stored in browser localStorage:

- **Bookings**: `skillpulse-bookings`
  ```json
  {
    "id": 1234567890,
    "mentorId": 1,
    "mentorName": "Dr. Aisha Khan",
    "date": "1/9/2026, 3:00:00 PM",
    "iso": "2026-01-09T15:00:00.000Z",
    "notes": "Student notes",
    "sessionNotes": "Mentor session notes"
  }
  ```

- **User Reports**: `skillpulse-userReports`
  ```json
  {
    "id": 1234567890,
    "bookingId": 1234567890,
    "mentorName": "Dr. Aisha Khan",
    "submittedAt": "2026-01-09T15:30:00.000Z",
    "rating": 5,
    "progress": "Learned new study techniques...",
    "feedback": "Great session, very helpful...",
    "goals": ["Goal 1", "Goal 2", "Goal 3"]
  }
  ```

---

## UI Components Used

Both new pages use:
- **Lucide React Icons**: Calendar, User, FileText, Star, Clock, CheckCircle, etc.
- **Responsive Grids**: Auto-filling grids for adaptive layouts
- **Modal System**: For viewing full reports
- **Star Rating System**: Interactive 5-star selector for feedback
- **Dark Mode Support**: Both components support dark/light theme

---

## Future Enhancements

Potential improvements:
1. **User Authentication**: Link mentors and students based on actual login
2. **Email Notifications**: Alert mentors when reports are submitted
3. **Analytics Dashboard**: Show mentor performance metrics
4. **Report Templates**: Pre-defined questions for structured feedback
5. **Session Scheduling**: Calendar-based booking with timezone support
6. **Payment Integration**: Track mentoring session costs
7. **Review Averages**: Calculate and display mentor ratings over time
8. **Session Recordings**: Store links to session recordings
9. **Follow-up Tasks**: Track action items from sessions
10. **Bulk Reports**: Generate PDF reports for multiple sessions

---

## Navigation

The new features are accessible from the main navigation bar:
- 📊 **Check-In** - Daily wellness check-in (existing)
- 📈 **Trends** - View wellness trends (existing)
- ✨ **Stress-Busters** - Calming activities (existing)
- ☕ **Mentoring** - Browse and book mentors (existing)
- 📊 **My Reports** - Submit/view session feedback (NEW)
- 🧠 **Mentor Hub** - Manage sessions and reports (NEW)

---

## Testing the Features

1. **Book a Session**:
   - Go to "Mentoring" tab
   - Click "Schedule Session" on a mentor
   - Set a past date/time for immediate completion
   - Book the session

2. **Submit a Report**:
   - Go to "My Reports" tab
   - Select the completed session
   - Fill in rating, progress, feedback, and goals
   - Submit

3. **View as Mentor**:
   - Go to "Mentor Hub" tab
   - View completed sessions in "Completed Sessions" section
   - Click "View User Report" to see student feedback

---

## Styling

Both components inherit styles from the main app's CSS:
- `.card` - Main container styling
- `.btn` - Button styles (primary, secondary, outline, danger)
- `.modal-overlay` and `.modal` - Modal popup styling
- CSS variables for colors (--primary, --text-secondary, etc.)
- Dark mode support through CSS classes

All components are fully responsive and work on mobile devices.

Role-based access control has been successfully implemented to ensure that:

