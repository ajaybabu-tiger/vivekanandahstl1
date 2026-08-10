/* =========================================================================
   Vivekananda Boys Hostel - Backend Express API Server (server.js)
   Provides Authentication, Student CRUD & WhatsApp/SMS Gateway Reminders
   ========================================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "vbh_secret_key_2026_moinabad_secure";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Middleware: Authenticate Owner JWT Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. Owner authentication token required." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid or expired session. Please log in again." });
        }
        req.owner = user;
        next();
    });
}

// Helper Function: Dispatches reminder message and saves audit log
async function dispatchStudentReminder(student, triggerType = 'MANUAL') {
    const hostelName = process.env.HOSTEL_NAME || "Vivekananda Boys Hostel";
    const amount = student.monthlyRent;
    const room = student.roomNumber;
    const phone = student.phone.startsWith('91') ? student.phone : `91${student.phone}`;

    // Exact Required Message Template
    const reminderMessage = `Hello ${student.fullName}, this is a reminder from ${hostelName}. Your rent of ₹${amount} for Room ${room} is due on ${student.dueDate}. Please pay at the earliest. Thank you.`;

    let whatsappSent = false;
    let smsSent = false;
    let dispatchLogs = [];

    // 1. Attempt Twilio WhatsApp / SMS if credentials exist
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
            const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            
            if (process.env.TWILIO_WHATSAPP_NUMBER) {
                await twilio.messages.create({
                    from: process.env.TWILIO_WHATSAPP_NUMBER,
                    to: `whatsapp:+${phone}`,
                    body: reminderMessage
                });
                whatsappSent = true;
                dispatchLogs.push("WhatsApp sent via Twilio API");
            }

            if (process.env.TWILIO_SMS_NUMBER) {
                await twilio.messages.create({
                    from: process.env.TWILIO_SMS_NUMBER,
                    to: `+${phone}`,
                    body: reminderMessage
                });
                smsSent = true;
                dispatchLogs.push("SMS sent via Twilio API");
            }
        } catch (twErr) {
            console.error("Twilio Gateway Error:", twErr.message);
            dispatchLogs.push(`Twilio Gateway Note: ${twErr.message}`);
        }
    }

    // 2. Attempt Fast2SMS (India SMS) if configured
    if (!smsSent && process.env.FAST2SMS_API_KEY) {
        try {
            const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    route: 'q',
                    message: reminderMessage,
                    language: 'english',
                    numbers: student.phone
                })
            });
            const data = await response.json();
            if (data && data.return) {
                smsSent = true;
                dispatchLogs.push("SMS dispatched via Fast2SMS Gateway");
            }
        } catch (fErr) {
            console.error("Fast2SMS Error:", fErr.message);
        }
    }

    // Direct WhatsApp Web Link generation (Instant 1-Click Fallback)
    const encodedMsg = encodeURIComponent(reminderMessage);
    const whatsappWebLink = `https://wa.me/${phone}?text=${encodedMsg}`;

    // Add entry to Audit Log
    const logEntry = db.addReminderLog({
        studentId: student.id,
        studentName: student.fullName,
        roomNumber: student.roomNumber,
        phone: student.phone,
        amount: student.monthlyRent,
        dueDate: student.dueDate,
        message: reminderMessage,
        triggerType,
        channel: (whatsappSent || smsSent) ? 'API Gateway' : 'WhatsApp Link',
        status: 'Sent'
    });

    return {
        studentName: student.fullName,
        phone: student.phone,
        messageText: reminderMessage,
        whatsappSent,
        smsSent,
        whatsappWebLink,
        dispatchLogs: dispatchLogs.length > 0 ? dispatchLogs : ["Direct WhatsApp link generated"],
        logEntry
    };
}

// Automatic Due Date Checking & Reminder Dispatcher
async function checkAndSendAutomatedReminders() {
    const students = db.getAllStudents();
    const unpaidStudents = students.filter(s => s.status === 'Unpaid');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayDayOfMonth = today.getDate();

    // 2 days from now date string
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);
    const twoDaysLaterStr = twoDaysLater.toISOString().split('T')[0];

    const processedList = [];

    for (const student of unpaidStudents) {
        if (!student.dueDate) continue;

        let shouldSend = false;

        // Exact date match (e.g. "2026-08-05")
        if (student.dueDate === todayStr || student.dueDate === twoDaysLaterStr) {
            shouldSend = true;
        } else {
            // Day of month match (e.g. 5th of every month)
            const dueDay = parseInt(student.dueDate.split('-')[2] || '0', 10);
            if (dueDay === todayDayOfMonth || dueDay === (todayDayOfMonth + 2)) {
                shouldSend = true;
            }
        }

        if (shouldSend) {
            console.log(`[CRON] Automatically dispatching monthly reminder for ${student.fullName} (Room ${student.roomNumber})...`);
            const result = await dispatchStudentReminder(student, 'AUTOMATIC_CRON');
            processedList.push(result);
        }
    }

    return {
        checkedTotal: unpaidStudents.length,
        automatedSentCount: processedList.length,
        processed: processedList
    };
}

// -------------------------------------------------------------
// 1. Authentication Routes
// -------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please provide both email address and password." });
    }

    const owner = db.getOwner();

    const isMatch = (email.toLowerCase().trim() === owner.email.toLowerCase().trim()) &&
                    bcrypt.compareSync(password, owner.passwordHash);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password. Only hostel owner can access." });
    }

    // Generate JWT Token valid for 24h
    const token = jwt.sign(
        { email: owner.email, name: owner.name, hostelName: owner.hostelName },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return res.json({
        success: true,
        message: "Login successful! Welcome to Vivekananda Boys Hostel Dashboard.",
        token,
        owner: {
            name: owner.name,
            email: owner.email,
            hostelName: owner.hostelName
        }
    });
});

// GET /api/auth/verify
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    return res.json({
        success: true,
        authenticated: true,
        owner: req.owner
    });
});

// -------------------------------------------------------------
// 2. Student Details Management Routes (Protected)
// -------------------------------------------------------------

// GET /api/students - List all students + summary statistics
app.get('/api/students', authenticateToken, (req, res) => {
    const students = db.getAllStudents();

    // Calculate Summary Metrics
    const totalStudents = students.length;
    const unpaidStudents = students.filter(s => s.status === 'Unpaid');
    const unpaidCount = unpaidStudents.length;
    const totalPendingAmount = unpaidStudents.reduce((sum, s) => sum + (Number(s.monthlyRent) || 0), 0);
    const paidStudents = students.filter(s => s.status === 'Paid');
    const totalCollectedAmount = paidStudents.reduce((sum, s) => sum + (Number(s.monthlyRent) || 0), 0);

    return res.json({
        success: true,
        metrics: {
            totalStudents,
            unpaidCount,
            totalPendingAmount,
            totalCollectedAmount
        },
        students
    });
});

// POST /api/students - Add new student
app.post('/api/students', authenticateToken, (req, res) => {
    const { fullName, roomNumber, phone, monthlyRent, dueDate, notes, status } = req.body;

    if (!fullName || !roomNumber || !phone || !monthlyRent || !dueDate) {
        return res.status(400).json({ success: false, message: "Please fill out all required student fields (Name, Room, Phone, Rent, Due Date)." });
    }

    const newStudent = db.addStudent({
        fullName: fullName.trim(),
        roomNumber: String(roomNumber).trim(),
        phone: String(phone).replace(/\D/g, ''),
        monthlyRent: Number(monthlyRent) || 5000,
        dueDate: dueDate,
        status: status || 'Unpaid',
        lastPaymentDate: status === 'Paid' ? new Date().toISOString().split('T')[0] : '',
        notes: notes ? notes.trim() : ''
    });

    return res.status(201).json({
        success: true,
        message: `Student '${newStudent.fullName}' added successfully!`,
        student: newStudent
    });
});

// PUT /api/students/:id - Edit existing student
app.put('/api/students/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const existing = db.getStudentById(id);

    if (!existing) {
        return res.status(404).json({ success: false, message: "Student record not found." });
    }

    const updated = db.updateStudent(id, req.body);
    return res.json({
        success: true,
        message: `Student '${updated.fullName}' updated successfully!`,
        student: updated
    });
});

// PATCH /api/students/:id/pay - One-click Mark as Paid
app.patch('/api/students/:id/pay', authenticateToken, (req, res) => {
    const { id } = req.params;
    const updated = db.markAsPaid(id);

    if (!updated) {
        return res.status(404).json({ success: false, message: "Student record not found." });
    }

    return res.json({
        success: true,
        message: `Rent for '${updated.fullName}' (Room ${updated.roomNumber}) marked as PAID!`,
        student: updated
    });
});

// DELETE /api/students/:id - Delete student
app.delete('/api/students/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const student = db.getStudentById(id);

    if (!student) {
        return res.status(404).json({ success: false, message: "Student record not found." });
    }

    db.deleteStudent(id);
    return res.json({
        success: true,
        message: `Student record '${student.fullName}' deleted successfully.`
    });
});

// -------------------------------------------------------------
// 3. Automated Payment Reminder Routes & Scheduled Cron Jobs
// -------------------------------------------------------------

// POST /api/reminders/send - Manual backup trigger
app.post('/api/reminders/send', authenticateToken, async (req, res) => {
    const { studentId } = req.body;
    const student = db.getStudentById(studentId);

    if (!student) {
        return res.status(404).json({ success: false, message: "Student record not found." });
    }

    if (student.status === 'Paid') {
        return res.status(400).json({ success: false, message: `Student '${student.fullName}' has already paid rent.` });
    }

    const result = await dispatchStudentReminder(student, 'MANUAL_BACKUP');
    return res.json({
        success: true,
        message: `Payment reminder processed for ${student.fullName}!`,
        ...result
    });
});

// GET /api/reminders/logs - Get sent message audit logs (Protected)
app.get('/api/reminders/logs', authenticateToken, (req, res) => {
    const logs = db.getReminderLogs();
    return res.json({
        success: true,
        total: logs.length,
        logs
    });
});

// GET /api/cron/check-reminders - Endpoint for Vercel Cron or Manual Testing
app.get('/api/cron/check-reminders', async (req, res) => {
    try {
        const result = await checkAndSendAutomatedReminders();
        return res.json({
            success: true,
            timestamp: new Date().toISOString(),
            message: `Automated reminder check completed. ${result.automatedSentCount} reminders sent out of ${result.checkedTotal} unpaid students.`,
            result
        });
    } catch (err) {
        console.error("Cron Execution Error:", err);
        return res.status(500).json({ success: false, message: "Cron execution failed.", error: err.message });
    }
});

// Schedule Daily Automated Cron Job (Runs every day at 09:00 AM)
cron.schedule('0 9 * * *', async () => {
    console.log('[CRON SCHEDULER] Running daily automated payment reminder check at 09:00 AM...');
    try {
        const result = await checkAndSendAutomatedReminders();
        console.log(`[CRON SCHEDULER] Completed check: ${result.automatedSentCount} reminders automatically dispatched.`);
    } catch (err) {
        console.error('[CRON SCHEDULER] Daily check error:', err);
    }
});

// Fallback route: Serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`  Vivekananda Boys Hostel Server is running on port ${PORT}`);
    console.log(`  Access Site: http://localhost:${PORT}`);
    console.log(`  Owner Portal Credentials: ${process.env.OWNER_EMAIL || "owner@vbh.com"} / ${process.env.OWNER_PASSWORD || "admin123"}`);
    console.log(`  Daily Automated Cron Job Scheduled at 09:00 AM`);
    console.log(`=============================================================`);
});

module.exports = app;
