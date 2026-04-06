const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// In-memory OTP store (email -> {otp, expires, userData})
const otpStore = {};

// Helper to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP for Signup
exports.sendSignupOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[email] = { otp, expires };

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your AgriML Account',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background-color: #ffffff;">
                    <h1 style="color: #2C4A34; text-align: center;">Welcome to AgriML!</h1>
                    <p style="text-align: center; color: #475569;">Use the following code to verify your account:</p>
                    <div style="background: #F2FCE2; padding: 20px; border-radius: 10px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2C4A34; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="text-align: center; color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `
        });

        res.status(200).json({ message: 'OTP sent to your email successfully!' });
    } catch (error) {
        console.error('Nodemailer Error:', error);
        res.status(500).json({ error: 'Failed to send verification email' });
    }
};

// Register User (with OTP verification)
exports.register = async (req, res) => {
    console.log("Registration request received for email:", req.body.email);
    const { name, email, password, phone, address, farming_type, experience_years, otp } = req.body;

    if (!name || !email || !password || !otp) {
        return res.status(400).json({ error: 'All fields including OTP are required' });
    }

    // Verify OTP
    const stored = otpStore[email];
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log("User already exists:", email);
            return res.status(400).json({ error: 'User already exists' });
        }

        console.log("Hashing password for:", email);
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("Inserting user into Supabase for:", email);
        // Insert user into Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    full_name: name,
                    email,
                    password: hashedPassword,
                    phone,
                    address,
                    farming_type,
                    experience_years: experience_years ? parseInt(experience_years) : null
                }
            ])
            .select();

        if (error) {
            console.error("Supabase Insertion Error:", error);
            throw error;
        }

        console.log("User registered successfully:", email);
        // Clear OTP
        delete otpStore[email];

        res.status(201).json({ message: 'User registered successfully', user: data[0] });
    } catch (error) {
        console.error("Registration Error Caught:", error);
        res.status(500).json({ error: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Get user from Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Success response
        res.status(200).json({
            message: 'Logged in successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                phone: user.phone,
                address: user.address,
                farming_type: user.farming_type,
                experience_years: user.experience_years
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(400).json({ error: 'No account found with this email' });
        }

        const otp = generateOTP();
        const expires = Date.now() + 10 * 60 * 1000;
        otpStore[email] = { otp, expires, type: 'reset' };

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset your AgriML Password',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background-color: #ffffff;">
                    <h1 style="color: #2C4A34; text-align: center;">Account Recovery</h1>
                    <p style="text-align: center; color: #475569;">Use the following code to reset your password:</p>
                    <div style="background: #F2FCE2; padding: 20px; border-radius: 10px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2C4A34; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="text-align: center; color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request a password reset, please secure your account.</p>
                </div>
            `
        });

        res.status(200).json({ message: 'Reset OTP sent to your email!' });
    } catch (error) {
        console.error('Full Nodemailer Error:', error);
        res.status(500).json({ error: 'Failed to send reset email' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const stored = otpStore[email];
    if (!stored || stored.otp !== otp || stored.type !== 'reset' || Date.now() > stored.expires) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (error) throw error;

        delete otpStore[email];
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Social Login Sync
exports.socialSync = async (req, res) => {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        // Check if user exists
        let { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) {
            // Create user for social login (no password needed as they use OAuth)
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        full_name: name || 'Google User',
                        email,
                        address: '',
                        farming_type: 'Other',
                        experience_years: 0
                    }
                ])
                .select();

            if (error) throw error;
            user = data[0];
        }

        res.status(200).json({
            message: 'Social sync successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                phone: user.phone,
                address: user.address,
                farming_type: user.farming_type,
                experience_years: user.experience_years
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Test Email Configuration
exports.testEmail = async (req, res) => {
    try {
        await transporter.verify();
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'AgriML Email Test',
            text: 'If you see this, your email configuration is working!'
        });
        res.status(200).json({ message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('Test Email Failed:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    const { id, name, phone, address, farming_type, experience_years } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID is required' });

    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                full_name: name,
                phone,
                address,
                farming_type,
                experience_years: experience_years ? parseInt(experience_years) : null
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Profile updated successfully', user: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Send Recommendation Report Email
exports.sendReport = async (req, res) => {
    const { email, report } = req.body;
    if (!email || !report) return res.status(400).json({ error: 'Email and report data are required' });

    try {
        const { crop, fertilizer, soil_correction, comparison, suggestions } = report;

        let suggestionsHtml = '';
        if (suggestions) {
            suggestionsHtml = `
                <h3 style="color: #2C4A34;">Suggestions for Improvement:</h3>
                <ul>
                    <li><strong>pH Adjustment:</strong> ${suggestions.ph_adjustment || 'N/A'}</li>
                    <li><strong>Nutrient Addition:</strong> ${suggestions.nutrient_addition || 'N/A'}</li>
                    <li><strong>Moisture Improvement:</strong> ${suggestions.moisture_improvement || 'N/A'}</li>
                    <li><strong>Organic Matter Correction:</strong> ${suggestions.organic_matter_correction || 'N/A'}</li>
                </ul>
            `;
        }

        let comparisonHtml = '';
        if (comparison) {
            comparisonHtml = `
                <h3 style="color: #2C4A34;">Soil Parameter Comparison:</h3>
                <ul>
                    ${Object.entries(comparison).map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`).join('')}
                </ul>
            `;
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `AgrirIse: Crop Recommendation Report for ${crop}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background-color: #ffffff;">
                    <h1 style="color: #2C4A34; text-align: center;">AgriML Report</h1>
                    <p>Hello,</p>
                    <p>Here is your detailed crop recommendation report:</p>
                    
                    <div style="background: #F2FCE2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0; color: #2C4A34;">Recommended Crop: ${crop}</h2>
                    </div>

                    <h3 style="color: #2C4A34;">Fertilizers:</h3>
                    <p>${Array.isArray(fertilizer) ? fertilizer.join(', ') : fertilizer}</p>

                    <h3 style="color: #2C4A34;">Soil Correction:</h3>
                    <p>${soil_correction}</p>

                    ${comparisonHtml}
                    ${suggestionsHtml}

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="text-align: center; color: #64748b; font-size: 12px;">
                        Generated by AgriML - Your Smart Farming Assistant
                    </p>
                </div>
            `
        });

        res.status(200).json({ message: 'Report emailed successfully!' });
    } catch (error) {
        console.error('Email Report Error:', error);
        res.status(500).json({ error: 'Failed to send report email' });
    }
};
