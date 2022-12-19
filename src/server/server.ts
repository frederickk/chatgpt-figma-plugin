import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv-safe';
import express, {Application, Request, Response} from 'express';
import {ChatGPTAPIBrowser} from 'chatgpt';
import {oraPromise} from 'ora';

import {PLUGIN_NAME, VERSION} from '../globals';
import plugins from './chat-rules';
import {ChatConfigure} from './chat-config';
import {routeDebug} from './route-debug';
import {routeSend} from './route-send';

const PORT = 3000;

dotenv.config({
  allowEmptyValues: true,
});

// Init ChatGPT API.
const api = new ChatGPTAPIBrowser({
  email: process.env.OPENAI_EMAIL || '',
  password: process.env.OPENAI_PASSWORD || '',
})
const config = new ChatConfigure(plugins, api);

// Create Express app.
const app: Application = express()
  .set('api', api)
  .set('config', config)
  .use(cors())
  .use(bodyParser.json({
    limit: '50mb',
    type: 'application/json'
  }))
  .use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }))
  .use('/v', (_res: Request, res: Response) => {
    res.send(`<pre>${PLUGIN_NAME} Figma Plugin\r\n${VERSION}</pre>`);
  })
  .use('/debug', routeDebug)
  .use('/send', routeSend);

/** Initializes Express server */
const init = () => {
  return new Promise<void>((resolve) => app.listen(PORT, () => resolve()));
}

// Starts ChatGPT API intermediate server.
(async () => {
  await oraPromise(api.initSession(), {
    text: `☎️ Connecting to ChatGPT`,
  });
  await oraPromise(api.getIsAuthenticated(), {
    text: '🔑 Confirming authetication status',
  });
  await oraPromise(config.train()!, {
    text: `👩‍🏫 Training ChatGPT (${config.rules.length} rules)`,
  });
  await oraPromise(init, {
    text: `👍 You may now launch the Figma plugin`,
  });
})();
