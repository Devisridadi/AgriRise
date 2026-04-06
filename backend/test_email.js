const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    console.log("Testing Email connectivity...");
    try {
        await transporter.verify();
        console.log("Transporter is ready!");
        
        // Don't actually send email yet, just verify transporter
    } catch (err) {
        console.error("Nodemailer Error:", err);
    }
}

testEmail().then(() => process.exit(0));
