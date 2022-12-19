/**
 * @fileoverview Handlers for events within plugin's UI panel.
 */

import {iconElems, textareaElems} from './elems';
import {fetchImageData, log, pendingButtonActive, pendingButtonReset, postMessage} from './methods';

interface KeyboardEvent {
  keyCode: number;
  metaKey: boolean;
}

// https://lexica.art/docs
interface ILexicaMetadata {
  id: string;
  gallery: string;
  src: string;
  srcSmall: string;
  prompt: string;
  width: number;
  height: number;
  seed: string;
  grid: boolean;
  model: string;
  guidance: number;
  promptid: string;
  nsfw: boolean;
  url: string;
}

/**
 * Fetches requests from given endpoint of ChatGPTAPI intermediate server.
 * @private
 * @param endpoint  endpoint for request type
 * @param message   optional body message
 */
const chatAPIFetch = async (endpoint: string, message: string = ''):
    Promise<Response> => {
  return await fetch(`http://localhost:3000/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  });
};

/**
 * Handles debug request to intermediate ChatGPTAPI server and passing
 * result into Figma.
 */
export const debugHandler = () => {
  if (!parent) return;

  chatAPIFetch('debug')
    .then((response) => response.json())
    .then(async (data) => {
      log(data);
    });
};

/** Handles passing of execution string into Figma. */
export const evalButtonHandler = () => {
  if (!parent) return;

  const message = textareaElems.eval.value;
  if (message) {
    pendingButtonActive(iconElems.eval);
    postMessage('get-eval', {message});
  }
};

// TODO: Refactor these handlers to be DRYer.
/** Handles passing of image buffer into Figma. */
export const imageButtonHandler = async () => {
  if (!parent) return;

  let metadata: ILexicaMetadata;

  const imageDescription = textareaElems.lexica.value;

  log(imageDescription);
  log('awaiting response...');

  textareaElems.lexica.disabled = true;
  pendingButtonActive(iconElems.lexica);

  const imageUrl = await fetch(
    `https://lexica.art/api/v1/search?q=${encodeURIComponent(
      imageDescription
    )}`, {
      method: 'GET',
    }
  );

  await imageUrl.json()
    .then(async (json) => {
      if (json?.images) {
        metadata = {
          ...json?.images[0],
          url: `https://image.lexica.art/md/${json?.images[0]?.id}`,
        };
        const bytes = await fetchImageData(metadata.url);

        return {bytes, metadata};
      }
    })
    .then((message) => {
      textareaElems.lexica.value = message!.metadata.prompt.trim();
      log(message!.metadata);
      postMessage('get-image', message);
    })
    .catch((error) => {
      textareaElems.lexica.classList.add('--error');
      log(error);
    })
    .finally(() => {
      textareaElems.lexica.disabled = false;
      window.setTimeout(() => {
        textareaElems.lexica.classList.remove('--error');
      }, 3000);

      pendingButtonReset(iconElems.lexica);
    });
}

/** Handles CMD+Enter submission of textarea contents. */
export const keyboardSubmitHandler = (event: KeyboardEvent,
    callback: Function) => {
  if (event.keyCode === 13 && event.metaKey) {
    callback();
  }
};

/**
 * Handles message requests to intermediate ChatGPTAPI server and passing
 * results into Figma.
 */
export const wdytButtonHandler = () => {
  if (!parent) return;

  const str = textareaElems.prompt.value;

  log(str);
  log('awaiting response...');

  textareaElems.prompt.disabled = true;
  pendingButtonActive(iconElems.wdyt);

  chatAPIFetch('send', str)
    .then((response) => {
      log(response);

      return response.json();
    })
    .then((data) => {
      log(data);
      const message = data.response;
      postMessage('get-response', {message});

      return data;
    })
    .then(async (data) => {
      if (data.imageUrl) {
        for (const url of data.imageUrl) {
          try {
            log(`fetching images... ${url}`);
            const bytes = await fetchImageData(url);
            postMessage('get-image', {bytes});
          } catch(err) {
            log(err);
          }
        }
      }
    })
    .catch((error) => {
      textareaElems.prompt.classList.add('--error');
      log(`Error. Make sure you're running the server by following the instructions. Also make sure you don't have an adblocker preventing requests to localhost:3000.`);
      log(error);
    })
    .finally(() => {
      textareaElems.prompt.disabled = false;
      window.setTimeout(() => {
        textareaElems.prompt.classList.remove('--error');
      }, 3000);

      pendingButtonReset(iconElems.wdyt);
    });
};
