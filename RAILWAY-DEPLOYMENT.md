# 🚂 Railway Deployment Guide - Email Server

## 📋 **Prerequisites**
1. GitHub account
2. Railway account (free tier available)
3. SendGrid API key

---

## 🚀 **Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

Your repository is already ready with:
- ✅ `server.js` - Email server
- ✅ `Procfile` - Deployment configuration
- ✅ `package-backend.json` - Backend dependencies

### **Step 2: Deploy to Railway**

1. **Visit Railway Dashboard**
   - Go to https://railway.app/
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `InvestmentWeb` repository

3. **Configure Deployment**
   - **Root Directory:** Leave empty (deploy from root)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

4. **Set Environment Variables**
   In Railway dashboard, go to your project → Variables tab and add:

   ```
   SENDGRID_API_KEY=SG.Cp3i9119R422Gk7zLcViFA.6g18GAsWSgBUU6mBRsO1pfQbIdE2y_EglVfgZ87h8
   ENCRYPTION_KEY=opessocius-secure-key-2024-production
   PORT=5001
   ```

5. **Deploy**
   - Railway will automatically deploy your app
   - Wait for the build to complete
   - Your app will be available at a Railway URL

### **Step 3: Get Your Production URL**

1. In Railway dashboard, go to your project
2. Click on the "Deployments" tab
3. Copy the generated URL (e.g., `https://your-app-name.railway.app`)

### **Step 4: Update Frontend Configuration**

Once you have your Railway URL, update the frontend API configuration:

1. **Update Email Service**
   ```javascript
   // src/firebase/emailService.js
   const API_BASE_URL = 'https://your-app-name.railway.app'
   ```

2. **Rebuild and Deploy Frontend**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🔧 **Alternative: Render Deployment**

If Railway doesn't work, try Render:

### **Step 1: Render Setup**
1. Go to https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### **Step 2: Connect Repository**
1. Connect your GitHub repository
2. Configure:
   - **Name:** opessocius-email-server
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

### **Step 3: Environment Variables**
Add in Render dashboard:
```
SENDGRID_API_KEY=SG.Cp3i9119R422Gk7zLcViFA.6g18GAsWSgBUU6mBRsO1pfQbIdE2y_EglVfgZ87h8
ENCRYPTION_KEY=opessocius-secure-key-2024-production
```

---

## 🧪 **Testing Your Deployment**

### **Health Check**
```bash
curl https://your-app-name.railway.app/api/health
```

Expected response:
```json
{"status":"OK","message":"Email service is running"}
```

### **Test Email Endpoint**
```bash
curl -X POST https://your-app-name.railway.app/api/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

---

## 🔒 **Security Considerations**

### **Environment Variables**
- ✅ Never commit API keys to Git
- ✅ Use Railway's environment variable system
- ✅ Rotate keys regularly

### **CORS Configuration**
- ✅ Only allow your frontend domain
- ✅ Configure proper headers

### **Rate Limiting**
- ✅ Consider adding rate limiting
- ✅ Monitor API usage

---

## 📊 **Monitoring**

### **Railway Dashboard**
- Monitor logs in real-time
- Track deployment status
- View resource usage

### **SendGrid Dashboard**
- Monitor email delivery
- Track bounce rates
- View analytics

---

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Build Fails**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for syntax errors

2. **Environment Variables Not Loading**
   - Verify variables are set in Railway dashboard
   - Check variable names match code
   - Restart deployment after changes

3. **Email Not Sending**
   - Verify SendGrid API key is correct
   - Check sender email is verified
   - Monitor Railway logs for errors

4. **CORS Errors**
   - Update CORS configuration in server.js
   - Add your frontend domain to allowed origins

### **Logs**
- Check Railway logs for detailed error messages
- Monitor SendGrid dashboard for email delivery issues
- Use browser developer tools for frontend errors

---

## 🔄 **Updates and Maintenance**

### **Automatic Deployments**
- Railway automatically deploys on Git push
- No manual intervention needed
- Rollback to previous versions if needed

### **Scaling**
- Railway automatically scales based on traffic
- Upgrade plan for higher limits if needed

---

## 📞 **Support**

- **Railway Support:** https://railway.app/docs
- **SendGrid Support:** https://support.sendgrid.com/
- **Email:** support@opessocius.com

---

**🎉 Your email server will be live and ready to handle all email functionality for your Opessocius platform!**
