# 📱 WhatsApp Connection Setup Guide

This application supports **TWO methods** to connect with WhatsApp. Choose the one that works best for you:

## 🚀 Method 1: WhatsApp Web Automation (FREE & EASY)

**✅ Recommended for beginners - No API keys needed!**

### What you need:
- Your phone with WhatsApp installed
- A computer with this application running

### Setup Steps:

1. **Configure Environment**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local
   ```

2. **Edit .env.local file** and set:
   ```env
   USE_WHATSAPP_BUSINESS_API=false
   WEB_SESSION_PATH=./whatsapp-session
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Connect WhatsApp**
   - Go to the dashboard
   - Click "Connect WhatsApp Web"
   - A QR code will appear in your terminal/console
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices > Link a Device
   - Scan the QR code with your phone
   - ✅ Done! Your WhatsApp is now connected

### ⚠️ Important Notes for WhatsApp Web:
- Keep your phone connected to internet
- Don't log out of WhatsApp Web manually
- The session will be saved for future use
- If disconnected, just scan QR code again

---

## 🏢 Method 2: WhatsApp Business API (PROFESSIONAL)

**💼 For businesses with high volume messaging**

### What you need:
- Meta Business Account
- WhatsApp Business API access (requires approval)
- Phone number verification

### Setup Steps:

1. **Get WhatsApp Business API Access**
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create a Meta Business Account
   - Apply for WhatsApp Business API access
   - Complete phone number verification
   - Wait for approval (can take 1-7 days)

2. **Get Your Credentials**
   After approval, you'll get:
   - Access Token
   - Phone Number ID
   - Webhook Verify Token

3. **Configure Environment**
   Edit your `.env.local` file:
   ```env
   USE_WHATSAPP_BUSINESS_API=true
   WHATSAPP_ACCESS_TOKEN=your_actual_access_token
   PHONE_NUMBER_ID=your_actual_phone_number_id
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

### ✅ Benefits of Business API:
- More reliable for high volume
- Better delivery rates
- Official Meta support
- Advanced features (templates, etc.)

### ❌ Limitations:
- Requires business verification
- May have costs for high volume
- More complex setup

---

## 🔧 Quick Setup (Recommended)

**For most users, start with WhatsApp Web:**

1. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **The default settings in .env.local are already configured for WhatsApp Web:**
   ```env
   USE_WHATSAPP_BUSINESS_API=false
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

4. **Go to http://localhost:8000**
   - Sign up for an account
   - Go to dashboard
   - Click "Connect WhatsApp Web"
   - Scan QR code with your phone
   - Start sending messages!

---

## 🆘 Troubleshooting

### WhatsApp Web Issues:

**Problem: QR code not appearing**
- Check terminal/console output
- Make sure port 8000 is not blocked
- Restart the application

**Problem: "Client not ready"**
- Wait 30 seconds after scanning QR code
- Check your phone's internet connection
- Try refreshing the page

**Problem: Messages not sending**
- Verify phone numbers have country codes
- Check if WhatsApp Web is still connected on your phone
- Try reconnecting by scanning QR code again

### Business API Issues:

**Problem: "Credentials not configured"**
- Double-check your .env.local file
- Ensure no extra spaces in tokens
- Restart the application after changes

**Problem: "Authentication failed"**
- Verify your access token is valid
- Check if your Business API access is still active
- Contact Meta support if needed

---

## 📞 Support

If you need help:
1. Check this guide first
2. Look at the terminal/console for error messages
3. Try the WhatsApp Web method (it's easier!)
4. Make sure your .env.local file is configured correctly

---

## 🎯 Next Steps

Once connected:
1. Upload your Excel contact list
2. Compose your message
3. Send and track delivery status
4. Export reports

**Happy messaging! 🚀**
