import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'SG.Cp3i9119R422Gk7zLcViFA.6g18GAsWSgBUU6mBRsO1pfQbIdE2y_EglVfgZ87h8');

// Email service class
class EmailService {
  constructor() {
    this.fromEmail = 'support@opessocius.com';
    this.fromName = 'Opessocius Support';
  }

  async sendWelcomeEmail(toEmail, name) {
    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: 'Welcome to Opessocius - Your Investment Journey Begins!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Opessocius</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Opessocius!</h1>
              <p>Your investment journey starts now</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Welcome to Opessocius! We're excited to have you join our community of discerning investors.</p>
              <p>Your account has been successfully created and you now have access to:</p>
              <ul>
                <li>Real-time portfolio tracking</li>
                <li>Monthly performance insights</li>
                <li>Personal advisor support</li>
                <li>Secure investment management</li>
              </ul>
              <p>Ready to start your investment journey?</p>
              <a href="https://investment-tracker-new.web.app/dashboard" class="button">Access Your Dashboard</a>
              <p>If you have any questions, our support team is here to help at support@opessocius.com</p>
            </div>
            <div class="footer">
              <p>© 2024 Opessocius. All rights reserved.</p>
              <p>This email was sent to ${toEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, message: error.message };
    }
  }

  async sendPasswordResetEmail(toEmail, encryptedToken) {
    const resetLink = `https://investment-tracker-new.web.app/reset-password?token=${encryptedToken}`;
    
    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: 'Reset Your Opessocius Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset - Opessocius</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
              <p>Secure your account</p>
            </div>
            <div class="content">
              <h2>Hello,</h2>
              <p>We received a request to reset your password for your Opessocius account. If you didn't make this request, you can safely ignore this email.</p>
              
              <div class="warning">
                <p><strong>⚠️ This link will expire in 1 hour for security reasons.</strong></p>
              </div>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3b82f6;">${resetLink}</p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Security Tips:</h3>
                <ul>
                  <li>Never share your password with anyone</li>
                  <li>Use a strong, unique password</li>
                  <li>Enable two-factor authentication if available</li>
                  <li>Log out from shared devices</li>
                </ul>
              </div>
              
              <p>If you have any questions, contact us at <a href="mailto:support@opessocius.com" style="color: #3b82f6;">support@opessocius.com</a></p>
            </div>
            <div class="footer">
              <p>© 2024 Opessocius. All rights reserved.</p>
              <p>This email was sent to ${toEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, message: error.message };
    }
  }

  async sendPasswordResetCode(toEmail, resetCode) {
    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: 'Your Password Reset Code - Opessocius',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset Code - Opessocius</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: #f1f5f9; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .code-number { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 4px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Code</h1>
              <p>Enter this code to reset your password</p>
            </div>
            <div class="content">
              <h2>Hello,</h2>
              <p>We received a request to reset your password for your Opessocius account. Use the verification code below to complete the process.</p>
              
              <div class="code">
                <h3>Your Verification Code</h3>
                <div class="code-number">${resetCode}</div>
                <p style="margin-top: 10px; color: #64748b;">Enter this 6-digit code in the password reset form</p>
              </div>
              
              <div class="warning">
                <h3>⚠️ Security Notice</h3>
                <p>This code will expire in 10 minutes for security reasons. If you didn't request this reset, please ignore this email.</p>
              </div>
              
              <p>If you have any questions, contact our support team at <a href="mailto:support@opessocius.com" style="color: #3b82f6;">support@opessocius.com</a></p>
            </div>
            <div class="footer">
              <p>© 2024 Opessocius. All rights reserved.</p>
              <p>This email was sent to ${toEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Password reset code sent successfully' };
    } catch (error) {
      console.error('Error sending password reset code:', error);
      return { success: false, message: error.message };
    }
  }



  async sendPasswordChangeConfirmation(toEmail, name) {
    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: 'Password Changed Successfully - Opessocius',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Changed - Opessocius</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #dcfce7; border: 1px solid #22c55e; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed Successfully</h1>
              <p>Your account security has been updated</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Your Opessocius account password has been successfully changed.</p>
              
              <div class="success">
                <h3>✅ Password Update Confirmed</h3>
                <p>Your new password is now active and you can use it to log in to your account.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="http://localhost:3000/login" class="button">Login to Your Account</a>
              </div>
              
              <div class="warning">
                <h3>⚠️ Security Notice</h3>
                <p>If you didn't change your password, please contact our support team immediately at <a href="mailto:support@opessocius.com" style="color: #3b82f6;">support@opessocius.com</a></p>
              </div>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Security Tips:</h3>
                <ul>
                  <li>Use a strong, unique password</li>
                  <li>Never share your password with anyone</li>
                  <li>Log out from shared devices</li>
                  <li>Enable two-factor authentication if available</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Opessocius. All rights reserved.</p>
              <p>This email was sent to ${toEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Password change confirmation sent successfully' };
    } catch (error) {
      console.error('Error sending password change confirmation:', error);
      return { success: false, message: error.message };
    }
  }

  async sendSignInConfirmation(toEmail, name, signInTime, credentials, password) {
    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: 'Sign-In Confirmation - Opessocius',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Sign-In Confirmation - Opessocius</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #dcfce7; border: 1px solid #22c55e; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .credentials { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sign-In Confirmation</h1>
              <p>Your account access</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We're confirming that you successfully signed into your Opessocius account.</p>
              
              <div class="success">
                <h3>✅ Sign-In Details</h3>
                <p><strong>Time:</strong> ${signInTime}</p>
                <p><strong>Status:</strong> Successful</p>
              </div>
              
              <div class="credentials">
                <h3>🔐 Your Login Credentials</h3>
                <p><strong>Username:</strong> ${credentials.username}</p>
                <p><strong>Email:</strong> ${credentials.email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><em>Keep these credentials secure and don't share them with anyone. You can always refer back to this email if you forget your login details.</em></p>
              </div>
              
              <div style="text-align: center;">
                                              <a href="https://investment-tracker-new.web.app/dashboard" class="button">Access Your Dashboard</a>
              </div>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>If this wasn't you:</h3>
                <p>Contact our support team immediately at <a href="mailto:support@opessocius.com" style="color: #3b82f6;">support@opessocius.com</a> or call us at <a href="tel:+9715780714671" style="color: #3b82f6;">+971-578-071-4671</a></p>
              </div>
              
              <p>Thank you for choosing Opessocius for your investment needs.</p>
            </div>
            <div class="footer">
              <p>© 2024 Opessocius. All rights reserved.</p>
              <p>This email was sent to ${toEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Sign-in confirmation email sent successfully' };
    } catch (error) {
      console.error('Error sending sign-in confirmation email:', error);
      return { success: false, message: error.message };
    }
  }

  async sendConsultationConfirmation(toEmail, name, consultationDetails) {
    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: 'Consultation Confirmed - Opessocius',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Consultation Confirmed - Opessocius</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #dcfce7; border: 1px solid #22c55e; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .details { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Consultation Confirmed!</h1>
              <p>Your investment consultation is scheduled</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Great news! Your consultation request has been confirmed by our team.</p>
              
              <div class="success">
                <h3>✅ Consultation Confirmed</h3>
                <p>Your consultation is now officially scheduled and confirmed.</p>
              </div>
              
              <div class="details">
                <h3>Consultation Details:</h3>
                <p><strong>Type:</strong> ${consultationDetails.type}</p>
                <p><strong>Date:</strong> ${consultationDetails.date}</p>
                <p><strong>Time:</strong> ${consultationDetails.time}</p>
                <p><strong>Timezone:</strong> Central European Summer Time (CEST)</p>
              </div>
              
              <div style="text-align: center;">
                <a href="http://localhost:3001/contact" class="button">View Contact Information</a>
              </div>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>What to expect:</h3>
                <ul>
                  <li><strong>5 minutes before your consultation:</strong> You'll receive an email with the Google Meet link</li>
                  <li>Our advisor will join the meeting at the scheduled time</li>
                  <li>We'll discuss your investment goals and strategies</li>
                  <li>You'll receive personalized recommendations</li>
                  <li>All consultations are free and confidential</li>
                </ul>
              </div>
              
              <p>If you need to reschedule or have any questions, please contact us at <a href="mailto:support@opessocius.com" style="color: #3b82f6;">support@opessocius.com</a></p>
            </div>
            <div class="footer">
              <p>© 2024 Opessocius. All rights reserved.</p>
              <p>This email was sent to ${toEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Consultation confirmation email sent successfully' };
    } catch (error) {
      console.error('Error sending consultation confirmation email:', error);
      return { success: false, message: error.message };
    }
  }

  async sendGoogleMeetLink(toEmail, name, consultationDetails, meetLink) {
    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: 'Your Consultation is Starting Soon - Google Meet Link',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Consultation Starting Soon - Opessocius</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .urgent { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .details { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Consultation is Starting Soon!</h1>
              <p>Join your Google Meet session</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Your consultation is scheduled to begin in 5 minutes. Please join the meeting using the link below.</p>
              
              <div class="urgent">
                <h3>⏰ Meeting Starting Soon</h3>
                <p><strong>Time:</strong> ${consultationDetails.time}</p>
                <p><strong>Date:</strong> ${consultationDetails.date}</p>
                <p><strong>Type:</strong> ${consultationDetails.type}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${meetLink}" class="button" target="_blank">Join Google Meet</a>
              </div>
              
              <div class="details">
                <h3>Meeting Instructions:</h3>
                <ul>
                  <li>Click the "Join Google Meet" button above</li>
                  <li>Allow camera and microphone access when prompted</li>
                  <li>Our advisor will join shortly</li>
                  <li>If you have technical issues, contact us immediately</li>
                </ul>
              </div>
              
              <p><strong>Meeting Link:</strong> <a href="${meetLink}" style="color: #3b82f6; word-break: break-all;">${meetLink}</a></p>
              
              <p>If you need assistance, contact us at <a href="mailto:support@opessocius.com" style="color: #3b82f6;">support@opessocius.com</a></p>
            </div>
            <div class="footer">
              <p>© 2024 Opessocius. All rights reserved.</p>
              <p>This email was sent to ${toEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Google Meet link email sent successfully' };
    } catch (error) {
      console.error('Error sending Google Meet link email:', error);
      return { success: false, message: error.message };
    }
  }
}

const emailService = new EmailService();

// Routes
app.post('/api/send-password-reset-email', async (req, res) => {
  try {
    const { email, resetToken } = req.body;
    if (!email || !resetToken) {
      return res.status(400).json({ success: false, message: 'Email and reset token are required' });
    }

    const result = await emailService.sendPasswordResetEmail(email, resetToken);
    res.json(result);
  } catch (error) {
    console.error('Error in password reset email endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/send-password-reset-code', async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    if (!email || !resetCode) {
      return res.status(400).json({ success: false, message: 'Email and reset code are required' });
    }

    const result = await emailService.sendPasswordResetCode(email, resetCode);
    res.json(result);
  } catch (error) {
    console.error('Error in password reset code endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/send-signin-confirmation', async (req, res) => {
  try {
    const { email, name, signInTime, credentials, password } = req.body;
    if (!email || !name || !signInTime) {
      return res.status(400).json({ success: false, message: 'Email, name, and sign-in time are required' });
    }

    const result = await emailService.sendSignInConfirmation(email, name, signInTime, credentials, password);
    res.json(result);
  } catch (error) {
    console.error('Error in sign-in confirmation endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/send-consultation-confirmation', async (req, res) => {
  try {
    const { email, name, consultationDetails } = req.body;
    if (!email || !name || !consultationDetails) {
      return res.status(400).json({ success: false, message: 'Email, name, and consultation details are required' });
    }

    const result = await emailService.sendConsultationConfirmation(email, name, consultationDetails);
    res.json(result);
  } catch (error) {
    console.error('Error in consultation confirmation endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/send-google-meet-link', async (req, res) => {
  try {
    const { email, name, consultationDetails, meetLink } = req.body;
    if (!email || !name || !consultationDetails || !meetLink) {
      return res.status(400).json({ success: false, message: 'Email, name, consultation details, and meet link are required' });
    }

    const result = await emailService.sendGoogleMeetLink(email, name, consultationDetails, meetLink);
    res.json(result);
  } catch (error) {
    console.error('Error in Google Meet link endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/send-welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Email and name are required' });
    }

    const result = await emailService.sendWelcomeEmail(email, name);
    res.json(result);
  } catch (error) {
    console.error('Error in welcome email endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/send-password-change-confirmation', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Email and name are required' });
    }

    const result = await emailService.sendPasswordChangeConfirmation(email, name);
    res.json(result);
  } catch (error) {
    console.error('Error in password change confirmation endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email service is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`📧 SendGrid API Key: ${process.env.SENDGRID_API_KEY ? 'Configured' : 'Using fallback'}`);
});
