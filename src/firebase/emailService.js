import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
sgMail.setApiKey('SG.Cp3i9119R422Gk7zLcViFA.6g18GAsWSgBUU6mBRsO1pfQbIdE2y_EglVfgZ87h8')

class EmailService {
  constructor() {
    // Use environment variable for API URL, fallback to localhost for development
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  }

  async sendWelcomeEmail(email, name) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send welcome email');
      }

      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendSignInConfirmation(email, name, signInTime, credentials, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-signin-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, signInTime, credentials, password }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send sign-in confirmation');
      }

      return result;
    } catch (error) {
      console.error('Error sending sign-in confirmation:', error);
      throw error;
    }
  }

  async sendGoogleMeetLink(email, name, consultationDetails, meetLink) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-google-meet-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, consultationDetails, meetLink }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send Google Meet link');
      }

      return result;
    } catch (error) {
      console.error('Error sending Google Meet link:', error);
      throw error;
    }
  }

  async sendConsultationConfirmation(email, name, consultationDetails) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-consultation-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, consultationDetails }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send consultation confirmation');
      }

      return result;
    } catch (error) {
      console.error('Error sending consultation confirmation:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, resetToken) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-password-reset-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetToken }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send password reset email');
      }

      return result;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendPasswordResetCode(email, resetCode) {
    try {
      console.log('📧 Sending password reset code to:', email, 'Code:', resetCode);
      
      const response = await fetch(`${this.apiBaseUrl}/send-password-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetCode }),
      });

      const result = await response.json();
      console.log('📧 Password reset code response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send password reset code');
      }

      return result;
    } catch (error) {
      console.error('Error sending password reset code:', error);
      throw error;
    }
  }

  async sendPasswordChangeConfirmation(email, name) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/send-password-change-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send password change confirmation');
      }

      return result;
    } catch (error) {
      console.error('Error sending password change confirmation:', error);
      throw error;
    }
  }

  generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default new EmailService();
