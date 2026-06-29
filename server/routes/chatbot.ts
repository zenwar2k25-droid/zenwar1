import express from 'express';
import { handleChatbotRequest } from '../chatbot/chatbot.controller';

const router = express.Router();

// POST /api/chatbot
router.post('/', handleChatbotRequest);

export default router;
