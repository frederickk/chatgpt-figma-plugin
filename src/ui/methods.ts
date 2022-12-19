/**
 * @fileoverview Methods for plugin UI.
 */

import JSONFormatter from 'json-formatter-js'
import {containerElems, textareaElems} from './elems';
import {EXAMPLE_REQS} from '../globals';

/** Fetches binary image data as Uint8Array from URL. */
export const fetchImageData = async (url: string): Promise<Uint8Array> => {
  const data = await fetch(url);
  const arrayBuffer = await data.arrayBuffer();

  return new Uint8Array(arrayBuffer);
};

/** Loads random query into prompt textarea. */
export const getRandomPrompt = () => {
  textareaElems.prompt.innerText =
    EXAMPLE_REQS[Math.floor(Math.random() * EXAMPLE_REQS.length)];
};

/** Logs given messages to #konsole container. */
export const log = (message: any = {}) => {
  const formatter = new JSONFormatter(message, 1, {
    theme: 'dark',
  });

  const entry = document.createElement('span');
  entry.classList.add('konsole__entry');
  entry.appendChild(formatter.render());
  containerElems.konsole.appendChild(entry);
  containerElems.konsole.scrollTop = -(containerElems.konsole.scrollHeight);
};

/**
 * Sends message to App.
 * @param  type     type of message
 * @param  message  payload
 */
export const postMessage = (type: string, message: any) => {
  (parent || figma.ui).postMessage({
    pluginMessage: {
      type,
      ...message,
    }
  }, '*');
};

/** Triggers pending (spinning sync icon) state for given element. */
export const pendingButtonActive = (elem: HTMLElement) => {
  elem.innerText = 'sync';
  elem.classList.add('--pending');
};

/** Removes pending (spinning sync icon) state from given element. */
export const pendingButtonReset = (elem: HTMLElement) => {
  elem.innerText = elem.dataset.default!;
  elem.classList.remove('--pending');
};

/** Sends message to plugin code to check status of clientStorage. */
export const getStorageState = (key: string) => {
  // TODO: Is this really the best/only way to read storageClient from the UI?
  postMessage('get-storage', {key});
};

/** Sends message to plugin code to set status of clientStorage. */
export const setStorageState = (key: string, message: boolean) => {
  postMessage('set-storage', {key, message});
};
