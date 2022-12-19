import express, {Request, Response} from 'express';
import {oraPromise} from 'ora';

export const routeSend = express.Router();

/** MS to timeout waiting on response. */
const TIMEOUT = 2 * 60 * 1000;

// Sends request to ChatGPT api for response.
routeSend.post('/', async (req: Request, res: Response) => {
  const api = req.app.get('api');
  const config = req.app.get('config');
  const text = req.body.message;

  try {
    const prompt: any = await oraPromise(api.sendMessage(text, {
      conversationId: config.conversationId,
      parentMessageId: config.messageId,
      timeoutMs: TIMEOUT,
    }), {
      text,
    });
    if (!prompt.imageUrl) prompt.imageUrl = [];

    const reply = await config.parse(prompt);
    config.conversationId = reply.conversationId;
    config.messageId = reply.messageId;

    console.log(`----------\n${JSON.stringify(reply, null, 2)}\n----------`);

    return res.status(200).json({...reply});
  } catch (error) {
    return res.status(500).send({error});
  }
});
