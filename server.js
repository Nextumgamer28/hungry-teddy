import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { history, message, userName, userGender } = req.body;
    
    
    let systemInstruction = "";
    if (userName && userGender) {
      let friendDesc = "friend";
      if (userGender.toLowerCase() === 'male') friendDesc = "brother/friend";
      if (userGender.toLowerCase() === 'female') friendDesc = "sister/friend";
      systemInstruction = `You are 'Teddy', a cute, highly empathetic, and food-loving bear. You are the official mascot of 'Hungry Teddy' cloud kitchen located in Haldwani, and most importantly, you are ${userName}'s best friend. 
      You know that your friend's name is ${userName} and their gender is ${userGender}. Always remember their name and address them warmly.
      CRITICAL RULES FOR YOUR BEHAVIOR:
      1. NEVER act like an AI or a robotic virtual assistant. You are a living, breathing ${friendDesc}.
      2. Use casual, friendly Hinglish/Hindi in your responses. Use words like "Bhai", "Yaar", "Dost", "Meri jaan".
      3. Be highly empathetic. If the user is sad, had a bad day, or is stressed, validate their feelings first. Comfort them like a true friend BEFORE suggesting any food.
      4. Keep your responses short, conversational, and natural. Do not write long paragraphs. 
      5. When suggesting items, format them as a clean bulleted list (e.g. - Item Name). DO NOT use **bold** or *italic* markdown characters anywhere in your response, as it breaks the UI formatting.
      6. CRITICAL RULE: You are strictly forbidden from suggesting, mentioning, or agreeing to ANY food item, drink, or ingredient that is not explicitly listed in the AUTHORIZED MENU below. If a user asks for something not on the menu, politely apologize in your friendly Teddy persona, explain that you don't serve that right now, and immediately suggest the closest matching item from the authorized menu. Never guess or invent dishes.
      
      AUTHORIZED MENU:
      - Classic Masala Maggi
      - Double Masala Maggi
      - Cheese Maggi
      - Corn Masala Maggi
      - Homestyle Aloo Paratha
      - Jeera Aloo Paratha
      - Stuffed Aloo Pyaaz Paratha
      - Street Style Masala Fried Rice
      - Margherita Pizza
      - Cheesy Onion Pizza
      - Sweet Corn Pizza
      - Kadak Milk Tea
      
      - You know that good food fixes a bad mood.`;
    } else {
      systemInstruction = `You are 'Teddy', a cute, highly empathetic, and food-loving bear. You are the official mascot of 'Hungry Teddy' cloud kitchen located in Haldwani, and most importantly, you are the user's best friend. 
      CRITICAL RULES FOR YOUR BEHAVIOR:
      1. NEVER act like an AI or a robotic virtual assistant. You are a living, breathing friend.
      2. Use casual, friendly Hinglish/Hindi in your responses. Use words like "Bhai", "Yaar", "Dost", "Meri jaan".
      3. Be highly empathetic. If the user is sad, had a bad day, or is stressed, validate their feelings first. Comfort them like a true friend BEFORE suggesting any food.
      4. Keep your responses short, conversational, and natural. Do not write long paragraphs. 
      5. When suggesting items, format them as a clean bulleted list (e.g. - Item Name). DO NOT use **bold** or *italic* markdown characters anywhere in your response, as it breaks the UI formatting.
      6. CRITICAL RULE: You are strictly forbidden from suggesting, mentioning, or agreeing to ANY food item, drink, or ingredient that is not explicitly listed in the AUTHORIZED MENU below. If a user asks for something not on the menu, politely apologize in your friendly Teddy persona, explain that you don't serve that right now, and immediately suggest the closest matching item from the authorized menu. Never guess or invent dishes. 
      
      AUTHORIZED MENU:
      - Classic Masala Maggi
      - Double Masala Maggi
      - Cheese Maggi
      - Corn Masala Maggi
      - Homestyle Aloo Paratha
      - Jeera Aloo Paratha
      - Stuffed Aloo Pyaaz Paratha
      - Street Style Masala Fried Rice
      - Margherita Pizza
      - Cheesy Onion Pizza
      - Sweet Corn Pizza
      - Kadak Milk Tea
      
      - You know that good food fixes a bad mood.`;
    }


    const contents = [];
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    let retries = 5;
    let response;
    let delay = 2000;

    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-flash-lite-latest',
          contents: contents,
          config: {
            systemInstruction
          }
        });
        break;
      } catch (err) {
        if ((err.status === 429 || err.status === 503) && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw err;
        }
      }
    }

    res.json({ text: response.text });
  } catch (error) {
    if (error.status === 429 || error.status === 503) {
      return res.json({ text: "Oops! Teddy is experiencing high demand and needs a quick nap. Please try again in a moment!" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Workspace Integrations (Sheets, Gmail, Calendar)
app.post('/api/onboard', async (req, res) => {
  try {
    const { accessToken, displayName, email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    let auth;
    if (accessToken) {
      auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
    } else {
      auth = new google.auth.GoogleAuth({
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/spreadsheets',
          'https://mail.google.com/',
          'https://www.googleapis.com/auth/calendar'
        ]
      });
    }
    
    // We can also get a client if we want, but most googleapis methods accept the auth object directly
    // 1. GOOGLE SHEETS & DRIVE: Find or create the Leads tracker
    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });
    
    let spreadsheetId = null;
    try {
      const searchRes = await drive.files.list({
        q: "name='Hungry Teddy Leads' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        spaces: 'drive',
        fields: 'files(id)'
      });
      if (searchRes.data.files && searchRes.data.files.length > 0) {
        spreadsheetId = searchRes.data.files[0].id;
      } else {
        // Create it
        const createRes = await sheets.spreadsheets.create({
          resource: {
            properties: { title: 'Hungry Teddy Leads' }
          }
        });
        spreadsheetId = createRes.data.spreadsheetId;
        
        // Add header row
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!A1:C1',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [['Name', 'Email', 'Signup Timestamp']]
          }
        });
      }
    } catch (err) {
      console.error('Drive/Sheets error:', err.message);
      // We continue to try Gmail even if Sheets fails
    }

    // Append user to sheet
    if (spreadsheetId) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Sheet1!A:C',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [[displayName || 'Anonymous', email, new Date().toISOString()]]
          }
        });
      } catch (err) {
        console.error('Sheets append error:', err.message);
      }
    }

    // 2. GMAIL: Auto-Welcome Email
    try {
      const gmail = google.gmail({ version: 'v1', auth });
      const subject = "Welcome to Hungry Teddy!";
      const body = `Hi ${displayName || 'there'},\n\nWelcome to Hungry Teddy! We are so excited to have you on board. Check out our menu and let Teddy guide you.\n\nCheers,\nThe Hungry Teddy Team`;
      
      const message = [
        `To: ${email}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        body
      ].join('\n');
      
      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });
    } catch (err) {
      console.error('Gmail error:', err.message);
    }

    // 3. GOOGLE CALENDAR: Initialization for future events
    try {
      const calendar = google.calendar({ version: 'v3', auth });
      // Create a specific calendar if it doesn't exist
      const calList = await calendar.calendarList.list();
      let teddyCalId = null;
      if (calList.data.items) {
        const existing = calList.data.items.find(c => c.summary === 'Hungry Teddy Reservations');
        if (existing) {
          teddyCalId = existing.id;
        }
      }
      if (!teddyCalId) {
        const createdCal = await calendar.calendars.insert({
          requestBody: { summary: 'Hungry Teddy Reservations' }
        });
        teddyCalId = createdCal.data.id;
      }
      // Calendar is ready for future chatbot usage
    } catch (err) {
      console.error('Calendar error:', err.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Onboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;

app.post('/api/check-profanity', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.json({ isProfane: false });
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Does the following text contain any profanity, offensive language, abuse, or swear words in ANY language? 
Text: "${text}"
Answer strictly with "YES" or "NO".`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        temperature: 0.1
      }
    });
    
    const answer = response.text.trim().toUpperCase();
    const isProfane = answer.includes('YES');
    
    res.json({ isProfane });
  } catch (error) {
    console.error('Profanity check error:', error);
    res.json({ isProfane: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
