// Email service for sending registration confirmations and password reset emails
// This is a mock implementation - in production, you would integrate with a real email service

class EmailService {
  constructor() {
    this.adminEmail = 'admin@opessocius.com'
    this.supportEmail = 'support@opessocius.com'
  }

  // Send registration confirmation email
  async sendRegistrationEmail(userData) {
    try {
      console.log('📧 Sending registration email to:', userData.email)
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const emailContent = {
        to: userData.email,
        subject: 'Welcome to Opessocius - Your Account is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Opessocius</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Professional Investment Management</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${userData.name},</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Welcome to Opessocius! Your investment account has been successfully created and is ready for you to start your investment journey.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0;">Account Details</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${userData.name}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${userData.email}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Initial Investment:</strong> €${userData.investmentAmount.toLocaleString()}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Account Created:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/login" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Login to Your Dashboard
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Our investment experts are ready to help you maximize your returns. You can access your personalized dashboard anytime to track your portfolio performance.
              </p>
              
              <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #333; margin: 0 0 10px 0;">What's Next?</h4>
                <ul style="color: #666; margin: 0; padding-left: 20px;">
                  <li>Login to your dashboard</li>
                  <li>Review your investment strategy</li>
                  <li>Connect with our support team</li>
                  <li>Start tracking your performance</li>
                </ul>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                If you have any questions, don't hesitate to contact our support team at ${this.supportEmail} or use the chat feature in your dashboard.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Best regards,<br>
                The Opessocius Team
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">© 2024 Opessocius. All rights reserved.</p>
              <p style="margin: 5px 0;">Professional investment management services.</p>
            </div>
          </div>
        `
      }
      
      console.log('✅ Registration email sent successfully')
      return { success: true, message: 'Registration email sent successfully' }
      
    } catch (error) {
      console.error('❌ Error sending registration email:', error)
      return { success: false, message: 'Failed to send registration email' }
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetCode) {
    try {
      console.log('📧 Sending password reset email to:', email)
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const emailContent = {
        to: email,
        subject: 'Opessocius - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Opessocius Investment Platform</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password for your Opessocius account. Use the verification code below to complete the process.
              </p>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: #333; margin: 0 0 15px 0;">Your Verification Code</h3>
                <div style="background: white; padding: 20px; border-radius: 8px; border: 2px dashed #667eea;">
                  <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${resetCode}</span>
                </div>
                <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
                  This code will expire in 10 minutes
                </p>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and contact our support team immediately.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                For security reasons, this code will expire in 10 minutes. If you need a new code, you can request another password reset from your dashboard.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                If you have any questions or need assistance, please contact our support team at ${this.supportEmail}.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Best regards,<br>
                The Opessocius Security Team
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">© 2024 Opessocius. All rights reserved.</p>
              <p style="margin: 5px 0;">Professional investment management services.</p>
            </div>
          </div>
        `
      }
      
      console.log('✅ Password reset email sent successfully')
      return { success: true, message: 'Password reset email sent successfully' }
      
    } catch (error) {
      console.error('❌ Error sending password reset email:', error)
      return { success: false, message: 'Failed to send password reset email' }
    }
  }

  // Send admin notification for new investor
  async sendAdminNotification(userData) {
    try {
      console.log('📧 Sending admin notification for new investor:', userData.email)
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const emailContent = {
        to: this.adminEmail,
        subject: 'New Investor Registration - Opessocius',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">New Investor Registration</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Opessocius Investment Platform</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #333; margin-bottom: 20px;">New Investor Account Created</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                A new investor has registered on the Opessocius platform. Please review their details and take any necessary actions.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0;">Investor Details</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${userData.name}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${userData.email}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${userData.phone}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Initial Investment:</strong> €${userData.investmentAmount.toLocaleString()}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/dashboard" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  View in Dashboard
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                This investor has been automatically added to your investor management system. You can view their details and manage their account from your admin dashboard.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">© 2024 Opessocius. All rights reserved.</p>
              <p style="margin: 5px 0;">Professional investment management services.</p>
            </div>
          </div>
        `
      }
      
      console.log('✅ Admin notification sent successfully')
      return { success: true, message: 'Admin notification sent successfully' }
      
    } catch (error) {
      console.error('❌ Error sending admin notification:', error)
      return { success: false, message: 'Failed to send admin notification' }
    }
  }

  // Generate a random 6-digit code
  generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}

export default new EmailService()
