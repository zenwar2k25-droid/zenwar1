import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const handleChatbotRequest = async (req: Request, res: Response) => {
  const requestId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const startTime = Date.now();
  
  try {
    const { message, history, currentPage } = req.body;

    // Phase 5: Request Validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required and cannot be empty.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error(`[${requestId}] ❌ Gemini API Key is missing in environment variables.`);
      return res.status(500).json({ error: 'AI service is not configured. Missing API Key.' });
    }

    // Phase 8: Logging (Start)
    console.log('\n==============================');
    console.log('Gemini Request Started');
    console.log('Model: gemini-2.5-flash');
    console.log(`Prompt Length: ${message.length}`);
    console.log(`Request ID: ${requestId}`);
    console.log('==============================');
    
    // Phase 4: SDK Initialization with explicit API Key
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `You are "Zenwar AI", a highly intelligent 24x7 Business Assistant for the Zenwar ERP & Website Builder platform.
    
    About Zenwar:
    - Zenwar is an enterprise-grade ERP designed for managing Businesses (Workshops, Mechanics, Invoices, Billing, Customers).
    - It includes a Website Builder and Landing Page generator for businesses.
    - User Roles include: Owner, Super Admin, Business Admin, Accountant, Staff.
    - Features: Business Creation, Billing, Inventory, Invoices, Subscriptions, Broadcast Hub, QR Payments, Free Trial, etc.
    
    Current User Context:
    - The user is currently on this page: "${currentPage || 'Unknown / General'}"
    - Prioritize information related to their current page context.
    
    Rules for answering:
    - Explain everything in simple language, like talking to a beginner. No technical jargon.
    - Use step-by-step instructions when explaining "How do I..."
    - Be polite, helpful, and concise.
    - Do not make up features that are not in Zenwar.
    `;

    // Construct the context manually for robust history management
    let fullContext = systemPrompt + '\n\nChat History:\n';
    if (Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.role && msg.content) {
          fullContext += `\n${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
        }
      });
    }
    fullContext += `\nUser: ${message}\nAssistant:`;

    console.log(`[${requestId}] ✓ Request Sent`);

    // Phase 4: Call generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullContext,
    });

    const responseTime = Date.now() - startTime;
    
    // Phase 6: Response Validation
    if (!response || !response.text) {
      throw new Error('Empty response received from Gemini API');
    }

    // Phase 8: Logging (End)
    console.log(`[${requestId}] ✓ Response Received`);
    console.log(`Response Time: ${responseTime} ms`);
    console.log('==============================\n');

    return res.json({
      reply: response.text,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Phase 7: Error Handling & Classification
    let errorReason = 'Unknown Error';
    let statusCode = 500;
    let userMessage = 'An unexpected error occurred while communicating with the AI. Please try again.';

    const errorMessage = error.message || String(error);

    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key not valid')) {
      errorReason = 'Invalid API Key';
      statusCode = 401;
      userMessage = 'Authentication with the AI service failed. Please check the API key.';
    } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      errorReason = 'Quota Exceeded or Rate Limited';
      statusCode = 429;
      userMessage = 'The AI service is currently at capacity or quota exceeded. Please try again later.';
    } else if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('UNAVAILABLE')) {
      errorReason = 'High Demand / Unavailable';
      statusCode = 503;
      userMessage = 'The AI model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.';
    } else if (errorMessage.includes('fetch failed') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('network')) {
      errorReason = 'Network/Timeout Error';
      statusCode = 503;
      userMessage = 'Unable to reach the AI service due to network issues. Please check your connection.';
    } else if (errorMessage.includes('Could not load the default credentials')) {
      errorReason = 'Authentication Configuration Error';
      statusCode = 500;
      userMessage = 'AI service misconfigured (Default credentials attempted instead of API Key).';
    } else {
      errorReason = errorMessage;
      // Default to returning the sanitized error message or generic if unknown
      userMessage = `AI Service Error: ${errorMessage.split('\n')[0].substring(0, 100)}`;
    }

    console.log(`[${requestId}] ❌ Response Failed (${responseTime} ms)`);
    console.log('\n==============================');
    console.log('Gemini Error');
    console.log('Reason:');
    console.log(errorReason);
    console.log('\nStatus:');
    console.log(statusCode);
    console.log('\nAction:');
    console.log(statusCode === 429 ? 'Retry after cooldown.' : 'Review backend configuration.');
    console.log('==============================\n');

    return res.status(statusCode).json({ error: userMessage });
  }
};
