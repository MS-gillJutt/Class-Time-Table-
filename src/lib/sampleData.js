// Sample dataset so the app works instantly before the admin uploads a real timetable.
export const SAMPLE = {
  version: 1,
  updatedAt: new Date().toISOString(),
  departments: [
    { id: 'cs', name: 'Computer Science' },
    { id: 'ee', name: 'Electrical Engineering' },
    { id: 'bba', name: 'Business Administration' },
  ],
  sections: [
    { id: 'cs-3a', deptId: 'cs', name: 'BS-CS · 3A' },
    { id: 'cs-3b', deptId: 'cs', name: 'BS-CS · 3B' },
    { id: 'ee-2a', deptId: 'ee', name: 'BE-EE · 2A' },
    { id: 'bba-1a', deptId: 'bba', name: 'BBA · 1A' },
  ],
  grid: {
    'cs-3a': {
      Mon: [
        { subject: 'Data Structures', teacher: 'Dr. Ayesha Khan', room: 'Room 204', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Operating Systems', teacher: 'Sir Bilal Ahmed', room: 'Room 205', start: '10:15', end: '11:15', type: 'Lecture' },
        { subject: 'Database Lab', teacher: 'Ms. Sara Iqbal', room: 'Lab 3', start: '11:30', end: '13:00', type: 'Lab' },
      ],
      Tue: [
        { subject: 'Computer Networks', teacher: 'Dr. Usman Tariq', room: 'Room 204', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Data Structures', teacher: 'Dr. Ayesha Khan', room: 'Room 204', start: '10:15', end: '11:15', type: 'Lecture' },
      ],
      Wed: [
        { subject: 'Operating Systems', teacher: 'Sir Bilal Ahmed', room: 'Room 205', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Software Engineering', teacher: 'Ms. Hina Raza', room: 'Room 207', start: '10:15', end: '11:15', type: 'Lecture' },
        { subject: 'Networks Lab', teacher: 'Dr. Usman Tariq', room: 'Lab 2', start: '11:30', end: '13:00', type: 'Lab' },
      ],
      Thu: [
        { subject: 'Database Systems', teacher: 'Ms. Sara Iqbal', room: 'Room 204', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Software Engineering', teacher: 'Ms. Hina Raza', room: 'Room 207', start: '10:15', end: '11:15', type: 'Lecture' },
      ],
      Fri: [
        { subject: 'Data Structures', teacher: 'Dr. Ayesha Khan', room: 'Room 204', start: '09:00', end: '09:45', type: 'Lecture' },
        { subject: 'Islamic Studies', teacher: 'Sir Imran Malik', room: 'Room 101', start: '10:00', end: '10:45', type: 'Lecture' },
      ],
      Sat: [],
      Sun: [],
    },
    'cs-3b': {
      Mon: [
        { subject: 'Data Structures', teacher: 'Dr. Kamran Shah', room: 'Room 206', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Operating Systems', teacher: 'Sir Daniyal Mir', room: 'Room 208', start: '10:15', end: '11:15', type: 'Lecture' },
      ],
      Tue: [
        { subject: 'Computer Networks', teacher: 'Dr. Farah Naz', room: 'Room 206', start: '09:00', end: '10:00', type: 'Lecture' },
      ],
      Wed: [
        { subject: 'Database Systems', teacher: 'Ms. Nadia Aslam', room: 'Room 206', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Database Lab', teacher: 'Ms. Nadia Aslam', room: 'Lab 1', start: '10:15', end: '11:45', type: 'Lab' },
      ],
      Thu: [
        { subject: 'Software Engineering', teacher: 'Sir Omer Farooq', room: 'Room 208', start: '09:00', end: '10:00', type: 'Lecture' },
      ],
      Fri: [
        { subject: 'Islamic Studies', teacher: 'Sir Imran Malik', room: 'Room 102', start: '09:00', end: '09:45', type: 'Lecture' },
      ],
      Sat: [],
      Sun: [],
    },
    'ee-2a': {
      Mon: [
        { subject: 'Circuit Theory', teacher: 'Dr. Rashid Minhas', room: 'Room 301', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Electronics I', teacher: 'Ms. Tehmina Gul', room: 'Room 302', start: '10:15', end: '11:15', type: 'Lecture' },
      ],
      Tue: [
        { subject: 'Circuit Lab', teacher: 'Dr. Rashid Minhas', room: 'EE Lab 1', start: '09:00', end: '11:00', type: 'Lab' },
      ],
      Wed: [
        { subject: 'Signals & Systems', teacher: 'Dr. Adnan Khalid', room: 'Room 301', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Electronics I', teacher: 'Ms. Tehmina Gul', room: 'Room 302', start: '10:15', end: '11:15', type: 'Lecture' },
      ],
      Thu: [
        { subject: 'Circuit Theory', teacher: 'Dr. Rashid Minhas', room: 'Room 301', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Math III', teacher: 'Dr. Saima Noor', room: 'Room 305', start: '10:15', end: '11:15', type: 'Lecture' },
      ],
      Fri: [
        { subject: 'Signals & Systems', teacher: 'Dr. Adnan Khalid', room: 'Room 301', start: '09:00', end: '09:45', type: 'Lecture' },
      ],
      Sat: [],
      Sun: [],
    },
    'bba-1a': {
      Mon: [
        { subject: 'Principles of Management', teacher: 'Ms. Fariha Javed', room: 'Room 401', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'Microeconomics', teacher: 'Sir Jawad Hassan', room: 'Room 402', start: '10:15', end: '11:15', type: 'Lecture' },
      ],
      Tue: [
        { subject: 'Business Math', teacher: 'Dr. Saima Noor', room: 'Room 401', start: '09:00', end: '10:00', type: 'Lecture' },
      ],
      Wed: [
        { subject: 'Microeconomics', teacher: 'Sir Jawad Hassan', room: 'Room 402', start: '09:00', end: '10:00', type: 'Lecture' },
        { subject: 'English Composition', teacher: 'Ms. Rabia Shahid', room: 'Room 403', start: '10:15', end: '11:15', type: 'Lecture' },
      ],
      Thu: [
        { subject: 'Principles of Management', teacher: 'Ms. Fariha Javed', room: 'Room 401', start: '09:00', end: '10:00', type: 'Lecture' },
      ],
      Fri: [
        { subject: 'Business Math', teacher: 'Dr. Saima Noor', room: 'Room 401', start: '09:00', end: '09:45', type: 'Lecture' },
      ],
      Sat: [],
      Sun: [],
    },
  },
  holidays: [],
};

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
