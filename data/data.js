// Dummy data for CampusConnect.
// Dates are generated relative to "today" so the demo always looks current.

function daysFromToday(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const currentStudent = {
  id: 1,
  name: "Aarav Sharma",
  email: "aarav.sharma@campus.edu",
  rollNo: "CS2023001",
  department: "Computer Science",
  year: "3rd Year",
  semester: "Semester 5",
  phone: "+91 98765 43210",
  location: "Pune, Maharashtra",
  cgpa: 8.7,
  bio: "Third-year CS student who loves building clean, fast web apps. Currently exploring Next.js, design systems and cloud deployment.",
};

export const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
];

export const students = [
  {
    id: 1,
    name: "Aarav Sharma",
    rollNo: "CS2023001",
    email: "aarav.sharma@campus.edu",
    phone: "+91 98765 43210",
    department: "Computer Science",
    year: "3rd Year",
    cgpa: 8.7,
    attendance: 92,
    skills: ["React", "Next.js", "JavaScript", "Figma"],
    courses: [1, 2, 3],
  },
  {
    id: 2,
    name: "Priya Patel",
    rollNo: "IT2024014",
    email: "priya.patel@campus.edu",
    phone: "+91 98220 11834",
    department: "Information Technology",
    year: "2nd Year",
    cgpa: 9.1,
    attendance: 88,
    skills: ["Python", "SQL", "HTML/CSS"],
    courses: [1, 4],
  },
  {
    id: 3,
    name: "Rohan Verma",
    rollNo: "EC2023022",
    email: "rohan.verma@campus.edu",
    phone: "+91 99870 45120",
    department: "Electronics",
    year: "3rd Year",
    cgpa: 7.6,
    attendance: 71,
    skills: ["C", "Arduino", "MATLAB"],
    courses: [5],
  },
  {
    id: 4,
    name: "Sneha Iyer",
    rollNo: "CS2022008",
    email: "sneha.iyer@campus.edu",
    phone: "+91 90040 77231",
    department: "Computer Science",
    year: "4th Year",
    cgpa: 9.4,
    attendance: 95,
    skills: ["Java", "Spring", "MySQL", "Docker"],
    courses: [2, 3],
  },
  {
    id: 5,
    name: "Karan Mehta",
    rollNo: "ME2025031",
    email: "karan.mehta@campus.edu",
    phone: "+91 97650 30981",
    department: "Mechanical",
    year: "1st Year",
    cgpa: 8.0,
    attendance: 84,
    skills: ["AutoCAD", "SolidWorks"],
    courses: [6],
  },
  {
    id: 6,
    name: "Ananya Gupta",
    rollNo: "IT2023019",
    email: "ananya.gupta@campus.edu",
    phone: "+91 98900 66412",
    department: "Information Technology",
    year: "3rd Year",
    cgpa: 8.9,
    attendance: 90,
    skills: ["Node.js", "MongoDB", "React"],
    courses: [1, 4],
  },
  {
    id: 7,
    name: "Vikram Rao",
    rollNo: "CS2024027",
    email: "vikram.rao@campus.edu",
    phone: "+91 91234 88001",
    department: "Computer Science",
    year: "2nd Year",
    cgpa: 7.9,
    attendance: 76,
    skills: ["C++", "DSA", "Linux"],
    courses: [2, 3],
  },
  {
    id: 8,
    name: "Meera Nair",
    rollNo: "EC2022005",
    email: "meera.nair@campus.edu",
    phone: "+91 90220 51177",
    department: "Electronics",
    year: "4th Year",
    cgpa: 8.5,
    attendance: 93,
    skills: ["VLSI", "Verilog", "Python"],
    courses: [5, 4],
  },
  {
    id: 9,
    name: "Arjun Desai",
    rollNo: "ME2023012",
    email: "arjun.desai@campus.edu",
    phone: "+91 98111 23450",
    department: "Mechanical",
    year: "3rd Year",
    cgpa: 7.2,
    attendance: 68,
    skills: ["ANSYS", "CATIA", "Thermodynamics"],
    courses: [6],
  },
];

export const courses = [
  {
    id: 1,
    code: "CS3503",
    name: "Full Stack Development",
    faculty: "Dr. Neha Kapoor",
    credits: 4,
    progress: 65,
    color: "teal",
    schedule: "Mon, Wed · 10:00 AM",
    room: "Lab 204",
    students: 64,
    description:
      "Learn to build modern, production-ready web applications using React, Next.js and Node.js — from component design to deployment.",
    modules: [
      { title: "HTML, CSS & Responsive Layouts", done: true },
      { title: "JavaScript Fundamentals", done: true },
      { title: "React Components & State", done: true },
      { title: "Next.js Routing & Layouts", done: false },
      { title: "APIs & Data Fetching", done: false },
      { title: "Deployment & Performance", done: false },
    ],
  },
  {
    id: 2,
    code: "CS3501",
    name: "Database Management Systems",
    faculty: "Prof. Rajesh Kumar",
    credits: 4,
    progress: 80,
    color: "indigo",
    schedule: "Tue, Thu · 11:30 AM",
    room: "Room 112",
    students: 72,
    description:
      "Relational databases, SQL, normalization, indexing and transactions — designing data that scales.",
    modules: [
      { title: "ER Modelling", done: true },
      { title: "Relational Algebra", done: true },
      { title: "SQL Queries & Joins", done: true },
      { title: "Normalization", done: true },
      { title: "Transactions & Concurrency", done: false },
    ],
  },
  {
    id: 3,
    code: "CS3502",
    name: "Operating Systems",
    faculty: "Dr. Meena Rao",
    credits: 3,
    progress: 50,
    color: "amber",
    schedule: "Mon, Fri · 2:00 PM",
    room: "Room 305",
    students: 58,
    description:
      "Processes, threads, CPU scheduling, memory management and file systems — how computers really run.",
    modules: [
      { title: "Processes & Threads", done: true },
      { title: "CPU Scheduling", done: true },
      { title: "Synchronization", done: false },
      { title: "Memory Management", done: false },
    ],
  },
  {
    id: 4,
    code: "IT3401",
    name: "Computer Networks",
    faculty: "Prof. Amit Singh",
    credits: 3,
    progress: 40,
    color: "sky",
    schedule: "Wed, Fri · 9:00 AM",
    room: "Lab 101",
    students: 66,
    description:
      "Network models, TCP/IP, routing, switching and the fundamentals of network security.",
    modules: [
      { title: "OSI & TCP/IP Models", done: true },
      { title: "IP Addressing & Subnetting", done: true },
      { title: "Routing Protocols", done: false },
      { title: "Transport Layer", done: false },
      { title: "Network Security Basics", done: false },
    ],
  },
  {
    id: 5,
    code: "EC3301",
    name: "Digital Electronics",
    faculty: "Dr. Suresh Nair",
    credits: 3,
    progress: 70,
    color: "violet",
    schedule: "Tue, Thu · 3:00 PM",
    room: "Lab 210",
    students: 48,
    description:
      "Logic gates, Boolean algebra, combinational and sequential circuits with hands-on lab work.",
    modules: [
      { title: "Number Systems", done: true },
      { title: "Boolean Algebra", done: true },
      { title: "Combinational Circuits", done: true },
      { title: "Sequential Circuits", done: false },
    ],
  },
  {
    id: 6,
    code: "ME2101",
    name: "Engineering Drawing",
    faculty: "Prof. Kavita Joshi",
    credits: 2,
    progress: 35,
    color: "rose",
    schedule: "Sat · 10:00 AM",
    room: "Studio 3",
    students: 40,
    description:
      "Fundamentals of technical drawing, projections and modern CAD tools.",
    modules: [
      { title: "Lines & Lettering", done: true },
      { title: "Orthographic Projection", done: false },
      { title: "Isometric Views", done: false },
      { title: "Intro to CAD", done: false },
    ],
  },
];

export const assignments = [
  { id: 1, title: "Build a Portfolio Website", courseId: 1, dueDate: daysFromToday(1), status: "Pending", points: 20 },
  { id: 2, title: "ER Diagram for Library System", courseId: 2, dueDate: daysFromToday(-2), status: "Submitted", points: 15, score: 14 },
  { id: 3, title: "CPU Scheduling Simulation", courseId: 3, dueDate: daysFromToday(6), status: "Pending", points: 25 },
  { id: 4, title: "Subnetting Worksheet", courseId: 4, dueDate: daysFromToday(-6), status: "Submitted", points: 10, score: 9 },
  { id: 5, title: "Next.js Routing Mini Project", courseId: 1, dueDate: daysFromToday(11), status: "Pending", points: 30 },
  { id: 6, title: "SQL Queries Practice", courseId: 2, dueDate: daysFromToday(-9), status: "Submitted", points: 10, score: 10 },
  { id: 7, title: "Flip-Flop Lab Report", courseId: 5, dueDate: daysFromToday(-1), status: "Pending", points: 15 },
  { id: 8, title: "Routing Table Analysis", courseId: 4, dueDate: daysFromToday(3), status: "Pending", points: 20 },
  { id: 9, title: "Orthographic Projection Sheet", courseId: 6, dueDate: daysFromToday(9), status: "Pending", points: 10 },
];

export const recentActivities = [
  { id: 1, type: "submit", text: "Submitted", target: "ER Diagram for Library System", time: "2 hours ago" },
  { id: 2, type: "grade", text: "Scored 18/20 in", target: "Operating Systems Quiz 2", time: "Yesterday" },
  { id: 3, type: "attend", text: "Attended lecture in", target: "Full Stack Development", time: "Yesterday" },
  { id: 4, type: "course", text: "New module unlocked in", target: "Computer Networks", time: "2 days ago" },
  { id: 5, type: "submit", text: "Submitted", target: "Subnetting Worksheet", time: "6 days ago" },
];

export const todaySchedule = [
  { id: 1, time: "09:00", end: "10:00", courseId: 4, type: "Lecture" },
  { id: 2, time: "10:00", end: "11:30", courseId: 1, type: "Lab" },
  { id: 3, time: "14:00", end: "15:00", courseId: 3, type: "Lecture" },
];

export const notifications = [
  { id: 1, text: "“Build a Portfolio Website” is due tomorrow", time: "1h ago", unread: true },
  { id: 2, text: "Dr. Neha Kapoor posted new notes in Full Stack Development", time: "3h ago", unread: true },
  { id: 3, text: "Your ER Diagram was graded: 14/15", time: "Yesterday", unread: false },
];

export function getCourse(id) {
  return courses.find((c) => c.id === Number(id));
}
