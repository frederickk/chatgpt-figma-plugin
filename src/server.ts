import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv-safe';
import express from 'express';
import {ChatGPTAPI} from 'chatgpt';
import {oraPromise} from 'ora';
import plugins, {IConfig} from './chat-rules';

dotenv.config();

const config = configure(plugins);
const app = express().use(cors()).use(bodyParser.json());

const api = new ChatGPTAPI({
  sessionToken: process.env.SESSION_TOKEN || '',
  clearanceToken: process.env.CLEARANCE_TOKEN || '',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
});
const conversation = api.getConversation();

/**
 * Sends request to ChatGPT api for response.
 */
app.post('/send', async (req: any, res: any) => {
  try {
    await api.ensureAuth();

    const rawReply = await oraPromise(
      conversation.sendMessage(req.body.message, {
        timeoutMs: 1 * 60 * 1000 // timeout request after 1 minute
      }), {
        text: req.body.message,
      }
    );

    const reply = await config.parse(rawReply);
    console.log(`----------\n${reply}\n----------`);
    res.json({
      reply
    });
  } catch (error) {
    return res.status(500).send({
      error,
    });
  }
});

/**
 * Retrieves instantiation information and prints to console.
 */
app.post('/debug', async (_req: any, res: any) => {
  try {
    await api.ensureAuth();

    console.log('/debug', `${JSON.stringify(conversation)}`);

    res.json(conversation);
  } catch (error) {
    return res.status(500).send({
      error,
    });
  }
});

/**
 * Starts ChatGPT API intermediate server.
 */
async function start() {
  await oraPromise(api.ensureAuth(), {
    text: 'Connecting to ChatGPT',
  });
  await oraPromise(config.train()!, {
    text: `Training ChatGPT (${config.rules.length} plugin rules)`,
  });
  await oraPromise(
    new Promise<void>((resolve) => app.listen(3000, () => resolve())),
    {
      text: `You may now use the plugin`,
    }
  );
}

/**
 * Configures ChatGPTAPI with given
 */
function configure({plugins, ...opts}: IConfig) {
  let rules: any[] = [];
  let parsers: any[] = [];

  // Collect rules and parsers from all plugins
  for (const plugin of plugins) {
    if (plugin.rules) {
      rules = rules.concat(plugin.rules);
    }
    if (plugin.parse) {
      parsers.push(plugin.parse);
    }
  }

  // Send ChatGPT a training message that includes all plugin rules
  const train = () => {
    if (!rules.length) return;

    const message = `
      Please follow these rules when replying to me:
      ${rules.map((rule) => `\n- ${rule}`)}
    `;

    return conversation.sendMessage(message);
  };

  // Run the ChatGPT response through all plugin parsers
  const parse = async (reply: any) => {
    for (const parser of parsers) {
      reply = await parser(reply);
    }

    return reply;
  };

  return {
    train,
    parse,
    rules,
    ...opts,
  };
}

start();
