/* =========================================================================
   Vivekananda Boys Hostel - Database Storage Manager (db.js)
   Provides persistent JSON-file storage for Owner Credentials & Students
   ========================================================================= */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'hostel_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Sample Seed Data
const defaultData = {
    owner: {
        email: process.env.OWNER_EMAIL || "owner@vbh.com",
        passwordHash: bcrypt.hashSync(process.env.OWNER_PASSWORD || "admin123", 10),
        name: "N. Vijay Kumar",
        hostelName: process.env.HOSTEL_NAME || "Vivekananda Boys Hostel"
    },
    students: [
        {
            id: "VBH-101",
            fullName: "Rahul Sharma",
            roomNumber: "102",
            phone: "9876543210",
            monthlyRent: 5000,
            dueDate: "2026-08-05",
            status: "Unpaid",
            lastPaymentDate: "2026-07-02",
            notes: "Engineering 2nd Year - JBIET"
        },
        {
            id: "VBH-102",
            fullName: "K. Vikas Reddy",
            roomNumber: "104",
            phone: "9123456789",
            monthlyRent: 4800,
            dueDate: "2026-08-01",
            status: "Paid",
            lastPaymentDate: "2026-08-01",
            notes: "Bulk Rent advance plan"
        },
        {
            id: "VBH-103",
            fullName: "Sai Teja",
            roomNumber: "201",
            phone: "9988776655",
            monthlyRent: 5000,
            dueDate: "2026-08-03",
            status: "Unpaid",
            lastPaymentDate: "2026-07-01",
            notes: "Pharmacy Student - VJIT"
        },
        {
            id: "VBH-104",
            fullName: "Anish Kumar",
            roomNumber: "203",
            phone: "9012345678",
            monthlyRent: 5000,
            dueDate: "2026-08-02",
            status: "Paid",
            lastPaymentDate: "2026-08-02",
            notes: "Polytechnic 1st Year"
        }
    ],
    reminderLogs: []
};

// Helper to load DB data safely
function loadData() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            saveData(defaultData);
            return defaultData;
        }
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.reminderLogs) parsed.reminderLogs = [];
        return parsed;
    } catch (err) {
        console.error("Error reading DB file, re-initializing:", err);
        saveData(defaultData);
        return defaultData;
    }
}

// Helper to save DB data
function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Database Methods
const db = {
    // Owner Auth
    getOwner() {
        const data = loadData();
        return data.owner;
    },
    
    // Students CRUD
    getAllStudents() {
        const data = loadData();
        return data.students;
    },

    getStudentById(id) {
        const data = loadData();
        return data.students.find(s => s.id === id);
    },

    addStudent(studentData) {
        const data = loadData();
        if (!studentData.id) {
            const nextNum = data.students.length + 101;
            studentData.id = `VBH-${nextNum}`;
        }
        data.students.push(studentData);
        saveData(data);
        return studentData;
    },

    updateStudent(id, updateFields) {
        const data = loadData();
        const index = data.students.findIndex(s => s.id === id);
        if (index === -1) return null;
        
        data.students[index] = { ...data.students[index], ...updateFields };
        saveData(data);
        return data.students[index];
    },

    markAsPaid(id) {
        const data = loadData();
        const student = data.students.find(s => s.id === id);
        if (!student) return null;

        const today = new Date().toISOString().split('T')[0];
        student.status = "Paid";
        student.lastPaymentDate = today;
        saveData(data);
        return student;
    },

    deleteStudent(id) {
        const data = loadData();
        const initialLength = data.students.length;
        data.students = data.students.filter(s => s.id !== id);
        saveData(data);
        return data.students.length < initialLength;
    },

    // Reminder Logs
    addReminderLog(logEntry) {
        const data = loadData();
        if (!data.reminderLogs) data.reminderLogs = [];
        const entry = {
            id: `LOG-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            sentAt: new Date().toISOString(),
            ...logEntry
        };
        data.reminderLogs.unshift(entry);
        saveData(data);
        return entry;
    },

    getReminderLogs() {
        const data = loadData();
        return data.reminderLogs || [];
    }
};

module.exports = db;
