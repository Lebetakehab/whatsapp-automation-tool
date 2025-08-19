# 📱 WhatsApp Automation Tool

A powerful, modern web application for automating WhatsApp messages to multiple contacts using Excel/CSV files. Built with Next.js 15, TypeScript, and supports both WhatsApp Web automation and WhatsApp Business API.

## 🚀 Quick Start (5 Minutes Setup)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
npm run db:migrate
```

### 3. Start the Application
```bash
npm run dev
```

### 4. Open in Browser
Go to [http://localhost:8000](http://localhost:8000)

### 5. Connect WhatsApp (Easy!)
1. Sign up for an account
2. Go to dashboard
3. Click "Connect WhatsApp Web"
4. Scan QR code with your phone
5. Start sending messages!

## 📱 How to Connect WhatsApp

### Method 1: WhatsApp Web (Recommended - FREE & EASY)

**✅ Perfect for beginners - No API keys needed!**

1. **Start the app**: `npm run dev`
2. **Sign up** and go to dashboard
3. **Click "Connect WhatsApp Web"**
4. **Scan QR code** with your phone:
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code shown in the app
5. **Done!** Start uploading contacts and sending messages

**Requirements:**
- Your phone with WhatsApp
- Keep phone connected to internet
- No API keys or business verification needed

### Method 2: WhatsApp Business API (Advanced)

**💼 For businesses with high-volume messaging**

1. **Get WhatsApp Business API access**:
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create Meta Business Account
   - Apply for WhatsApp Business API
   - Complete verification (takes 1-7 days)

2. **Configure environment**:
   ```bash
   # Edit .env.local
   USE_WHATSAPP_BUSINESS_API=true
   WHATSAPP_ACCESS_TOKEN=your_actual_token
   PHONE_NUMBER_ID=your_phone_number_id
   ```

3. **Restart the app**: `npm run dev`

## 🎯 How to Use

### Step 1: Connect WhatsApp
- Choose WhatsApp Web (easy) or Business API (advanced)
- Follow the connection guide in the app

### Step 2: Upload Contacts
- Prepare Excel (.xlsx) or CSV file with:
  - **Phone** column (required): +1234567890
  - **Name** column (optional): Contact names
- Drag and drop your file
- Review imported contacts

### Step 3: Compose Message
- Write your message
- Use `[Name]` to personalize (e.g., "Hi [Name], how are you?")
- Preview how messages will look
- Add emojis and formatting

### Step 4: Send & Track
- Send messages to all contacts
- Monitor delivery status in real-time
- Export delivery reports
- View success/failure statistics

## 📊 Excel File Format

Your Excel/CSV file should have these columns:

| Phone | Name | 
|-------|------|
| +1234567890 | John Doe |
| +1987654321 | Jane Smith |
| +1555123456 | Bob Johnson |

**Tips:**
- Include country code (+1, +44, etc.)
- Phone column is required
- Name column is optional but recommended
- Supports .xlsx, .xls, and .csv files
- Maximum 10MB file size

## 🔧 Configuration

The app is pre-configured for WhatsApp Web (easiest method). All settings are in `.env.local`:

```env
# Default settings (no changes needed for WhatsApp Web)
USE_WHATSAPP_BUSINESS_API=false
WEB_SESSION_PATH=./whatsapp-session

# Only change these if using Business API
WHATSAPP_ACCESS_TOKEN=your_token
PHONE_NUMBER_ID=your_phone_id
```

## 🆘 Troubleshooting

### WhatsApp Web Issues

**❌ QR code not showing**
- Check terminal/console for QR code
- Wait 30 seconds and try again
- Restart the app: `npm run dev`

**❌ "Client not ready" error**
- Wait 1 minute after scanning QR code
- Check phone's internet connection
- Try reconnecting (scan QR again)

**❌ Messages not sending**
- Verify phone numbers have country codes
- Check WhatsApp Web is still connected on phone
- Reconnect by scanning QR code again

### General Issues

**❌ App won't start**
```bash
# Try these commands:
npm install
npm run db:migrate
npm run dev
```

**❌ Database errors**
```bash
# Reset database:
rm prisma/dev.db
npm run db:migrate
```

**❌ Port 8000 in use**
```bash
# Kill process and restart:
fuser -k 8000/tcp
npm run dev
```

## 🎨 Features

### ✅ Dual WhatsApp Integration
- **WhatsApp Web**: Free, easy setup with QR code
- **Business API**: Professional, high-volume messaging

### ✅ Excel/CSV Processing
- Drag-and-drop file upload
- Phone number validation
- Contact preview and verification
- Support for .xlsx, .xls, .csv files

### ✅ Message Personalization
- Use `[Name]` for personalized messages
- Message preview before sending
- Emoji and formatting support
- Bulk message composition

### ✅ Real-time Tracking
- Live delivery status updates
- Success/failure statistics
- Export delivery reports
- Message queue management

### ✅ User Management
- Secure authentication
- User accounts and sessions
- Contact history storage
- Campaign management

### ✅ Modern UI/UX
- Clean, professional design
- Mobile-responsive interface
- Step-by-step wizard
- Real-time status updates

## 🛠 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **WhatsApp**: whatsapp-web.js + Business API
- **File Processing**: xlsx library
- **Deployment**: Vercel-ready

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open database browser

# Utilities
npm run lint         # Run ESLint
```

## 🔒 Security & Privacy

- All data stored locally in SQLite database
- No external data sharing
- Secure password hashing
- Session-based authentication
- WhatsApp Web uses official protocols

## 📞 Support

### Need Help?

1. **Check this README** - Most questions are answered here
2. **View Setup Guide** - Open `WHATSAPP_SETUP_GUIDE.md`
3. **Check terminal output** - Look for error messages
4. **Try WhatsApp Web first** - It's the easiest method

### Common Questions

**Q: Do I need a business account?**
A: No! Use WhatsApp Web method - just scan QR code with your personal WhatsApp.

**Q: Is this free?**
A: Yes! WhatsApp Web method is completely free. Business API may have costs for high volume.

**Q: How many messages can I send?**
A: WhatsApp Web: Depends on your account. Business API: Higher limits with approval.

**Q: Is my data safe?**
A: Yes! Everything runs locally on your computer. No data is sent to external servers.

## 🎉 Ready to Start?

1. Run `npm run dev`
2. Go to http://localhost:8000
3. Sign up for an account
4. Connect WhatsApp Web (scan QR code)
5. Upload your contacts
6. Send your first automated messages!

**Happy messaging! 🚀📱**
