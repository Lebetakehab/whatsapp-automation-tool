import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

interface Contact {
  id: string;
  phone: string;
  name?: string;
  customMessage?: string;
}

interface MessageResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

interface WhatsAppClientState {
  client: Client | null;
  isReady: boolean;
  isConnecting: boolean;
  currentQR: string | null;
  lastError: string | null;
  connectionAttempts: number;
}

// WhatsApp Web Automation Client State
const clientState: WhatsAppClientState = {
  client: null,
  isReady: false,
  isConnecting: false,
  currentQR: null,
  lastError: null,
  connectionAttempts: 0
};

// Maximum connection attempts before giving up
const MAX_CONNECTION_ATTEMPTS = 3;
const CONNECTION_TIMEOUT = 120000; // 2 minutes

// Ensure session directory exists
function ensureSessionDirectory(): string {
  const sessionPath = process.env.WEB_SESSION_PATH || './whatsapp-session';
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }
  return sessionPath;
}

// Clean up old session if corrupted
function cleanupSession(): void {
  try {
    const sessionPath = ensureSessionDirectory();
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      console.log('Cleaned up corrupted WhatsApp session');
    }
  } catch (error) {
    console.error('Error cleaning up session:', error);
  }
}

// Get current QR code
export function getCurrentQRCode(): string | null {
  return clientState.currentQR || (global as any).currentQRCode || null;
}

// Initialize WhatsApp Web Client with improved error handling
export async function initializeWhatsAppWebClient(): Promise<void> {
  // If already connecting, don't start another connection
  if (clientState.isConnecting) {
    console.log('WhatsApp client is already connecting...');
    return;
  }

  // If client exists and is ready, don't reinitialize
  if (clientState.client && clientState.isReady) {
    console.log('WhatsApp client is already ready');
    return;
  }

  // Check connection attempts
  if (clientState.connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    throw new Error(`Maximum connection attempts (${MAX_CONNECTION_ATTEMPTS}) exceeded. Please try again later.`);
  }

  clientState.isConnecting = true;
  clientState.connectionAttempts++;
  clientState.lastError = null;
  clientState.currentQR = null;

  try {
    // Clean up any existing client
    if (clientState.client) {
      try {
        await clientState.client.destroy();
      } catch (error) {
        console.log('Error destroying existing client:', error);
      }
      clientState.client = null;
      clientState.isReady = false;
    }

    // Ensure session directory exists
    const sessionPath = ensureSessionDirectory();

    console.log('Initializing WhatsApp Web client...');
    
    clientState.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: sessionPath,
        clientId: 'whatsapp-bulk-client'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        timeout: 60000
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      }
    });

    // Set up event handlers
    clientState.client.on('qr', (qr) => {
      console.log('QR Code received, scan with your phone:');
      qrcode.generate(qr, { small: true });
      
      // Store QR code for API access
      clientState.currentQR = qr;
      (global as any).currentQRCode = qr;
      
      console.log('QR Code stored for API access');
    });

    clientState.client.on('ready', () => {
      console.log('✅ WhatsApp Web client is ready!');
      clientState.isReady = true;
      clientState.isConnecting = false;
      clientState.currentQR = null;
      clientState.connectionAttempts = 0; // Reset attempts on successful connection
      (global as any).currentQRCode = null;
    });

    clientState.client.on('authenticated', () => {
      console.log('✅ WhatsApp Web client authenticated successfully');
    });

    clientState.client.on('auth_failure', (msg) => {
      console.error('❌ Authentication failed:', msg);
      clientState.lastError = `Authentication failed: ${msg}`;
      clientState.isReady = false;
      clientState.isConnecting = false;
      
      // Clean up session on auth failure
      setTimeout(() => {
        cleanupSession();
      }, 1000);
    });

    clientState.client.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp Web client disconnected:', reason);
      clientState.isReady = false;
      clientState.isConnecting = false;
      clientState.currentQR = null;
      clientState.lastError = `Disconnected: ${reason}`;
      
      // Auto-reconnect after disconnection (unless it's a logout)
      if (reason !== 'LOGOUT') {
        console.log('Attempting to reconnect in 5 seconds...');
        setTimeout(() => {
          initializeWhatsAppWebClient().catch(console.error);
        }, 5000);
      }
    });

    clientState.client.on('loading_screen', (percent, message) => {
      console.log('Loading screen:', percent, message);
    });

    // Set connection timeout
    const timeoutId = setTimeout(() => {
      if (clientState.isConnecting) {
        console.error('❌ Connection timeout after 2 minutes');
        clientState.lastError = 'Connection timeout';
        clientState.isConnecting = false;
        
        if (clientState.client) {
          clientState.client.destroy().catch(console.error);
          clientState.client = null;
        }
      }
    }, CONNECTION_TIMEOUT);

    // Initialize the client
    await clientState.client.initialize();
    
    // Clear timeout if initialization succeeds
    clearTimeout(timeoutId);

  } catch (error) {
    console.error('❌ Error initializing WhatsApp client:', error);
    clientState.lastError = error instanceof Error ? error.message : 'Unknown initialization error';
    clientState.isConnecting = false;
    clientState.isReady = false;
    
    if (clientState.client) {
      try {
        await clientState.client.destroy();
      } catch (destroyError) {
        console.error('Error destroying failed client:', destroyError);
      }
      clientState.client = null;
    }
    
    throw error;
  }
}

// Format phone number for WhatsApp
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming +1 for US/Canada)
  if (cleaned.length === 10) {
    return `1${cleaned}`;
  }
  
  return cleaned;
}

// Send message using WhatsApp Business API
export async function sendMessageUsingBusinessAPI(
  contact: Contact,
  message: string,
  attachments?: File[]
): Promise<MessageResult> {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp Business API credentials not configured');
    }

    const formattedPhone = formatPhoneNumber(contact.phone);
    const personalizedMessage = message.replace(/\[Name\]/g, contact.name || 'there');

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: personalizedMessage
      }
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to send message');
    }

    return {
      success: true,
      messageId: result.messages?.[0]?.id
    };
  } catch (error) {
    console.error('WhatsApp Business API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Send message using WhatsApp Web Automation
export async function sendMessageUsingWebAutomation(
  contact: Contact,
  message: string,
  attachments?: File[]
): Promise<MessageResult> {
  try {
    if (!clientState.client || !clientState.isReady) {
      throw new Error('WhatsApp Web client not ready. Please initialize first.');
    }

    const formattedPhone = formatPhoneNumber(contact.phone);
    const chatId = `${formattedPhone}@c.us`;
    const personalizedMessage = message.replace(/\[Name\]/g, contact.name || 'there');

    // Check if contact exists
    const chat = await clientState.client.getChatById(chatId).catch(() => null);
    
    if (!chat) {
      // Try to create chat by sending a message
      await clientState.client.sendMessage(chatId, personalizedMessage);
    } else {
      await chat.sendMessage(personalizedMessage);
    }

    // Handle attachments if provided
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const media = MessageMedia.fromFilePath(attachment.name);
        await clientState.client.sendMessage(chatId, media);
      }
    }

    return {
      success: true,
      messageId: `web_${Date.now()}`
    };
  } catch (error) {
    console.error('WhatsApp Web automation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Batch send messages with automatic retry and rate limiting
export async function sendMessagesBatch(
  contacts: Contact[],
  message: string,
  batchSize: number = 50,
  delayBetweenMessages: number = 2000,
  maxRetries: number = 3
): Promise<{ results: MessageResult[]; summary: { total: number; successful: number; failed: number } }> {
  const results: MessageResult[] = [];
  const batches = [];
  
  // Split contacts into batches
  for (let i = 0; i < contacts.length; i += batchSize) {
    batches.push(contacts.slice(i, i + batchSize));
  }

  console.log(`Processing ${contacts.length} contacts in ${batches.length} batches of ${batchSize}`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} contacts)`);

    for (let contactIndex = 0; contactIndex < batch.length; contactIndex++) {
      const contact = batch[contactIndex];
      let attempts = 0;
      let success = false;
      let lastError = '';

      while (attempts < maxRetries && !success) {
        attempts++;
        
        try {
          // Add delay between messages to avoid rate limiting
          if (results.length > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
          }

          const result = await sendMessage(contact, message);
          results.push({
            ...result,
            contactId: contact.id
          } as MessageResult & { contactId: string });

          if (result.success) {
            success = true;
            console.log(`✅ Message sent to ${contact.name || contact.phone} (attempt ${attempts})`);
          } else {
            lastError = result.error || 'Unknown error';
            console.log(`❌ Failed to send to ${contact.name || contact.phone} (attempt ${attempts}): ${lastError}`);
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';
          console.log(`❌ Error sending to ${contact.name || contact.phone} (attempt ${attempts}): ${lastError}`);
        }

        // If not successful and we have more attempts, wait before retrying
        if (!success && attempts < maxRetries) {
          console.log(`⏳ Retrying in ${delayBetweenMessages}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
        }
      }

      // If all attempts failed, add a failed result
      if (!success) {
        results.push({
          success: false,
          error: lastError,
          contactId: contact.id
        } as MessageResult & { contactId: string });
      }
    }

    // Add delay between batches
    if (batchIndex < batches.length - 1) {
      const batchDelay = 5000; // 5 seconds between batches
      console.log(`⏳ Waiting ${batchDelay}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`📊 Batch processing complete: ${successful} successful, ${failed} failed out of ${contacts.length} total`);

  return {
    results,
    summary: {
      total: contacts.length,
      successful,
      failed
    }
  };
}

// Main send message function that chooses the method based on environment
export async function sendMessage(
  contact: Contact,
  message: string,
  attachments?: File[]
): Promise<MessageResult> {
  const useBusinessAPI = process.env.USE_WHATSAPP_BUSINESS_API === 'true';

  if (useBusinessAPI) {
    return await sendMessageUsingBusinessAPI(contact, message, attachments);
  } else {
    return await sendMessageUsingWebAutomation(contact, message, attachments);
  }
}

// Get WhatsApp Web client status
export function getWhatsAppWebStatus(): { 
  ready: boolean; 
  client: boolean; 
  connecting: boolean; 
  error: string | null;
  qr: string | null;
} {
  return {
    ready: clientState.isReady,
    client: clientState.client !== null,
    connecting: clientState.isConnecting,
    error: clientState.lastError,
    qr: clientState.currentQR
  };
}

// Disconnect WhatsApp Web client
export async function disconnectWhatsAppWeb(): Promise<void> {
  if (clientState.client) {
    try {
      await clientState.client.destroy();
    } catch (error) {
      console.error('Error destroying WhatsApp client:', error);
    }
    clientState.client = null;
    clientState.isReady = false;
    clientState.isConnecting = false;
    clientState.currentQR = null;
    clientState.lastError = null;
    clientState.connectionAttempts = 0;
  }
}

// Reset connection attempts (useful for manual retry)
export function resetConnectionAttempts(): void {
  clientState.connectionAttempts = 0;
  clientState.lastError = null;
}
