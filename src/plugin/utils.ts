/**
 * @fileoverview Utility methods for plugin.
 */

import {PLUGIN_NAME} from '../globals';

/** Executes given code. */
export const executeEval = (str: string) => {
  if (str) {
    log(`Executing code:\n${str}\m`);

    try {
      eval(str);
    } finally {
      setTimeout(() => {
        figma.ui.postMessage({
          type: 'done-eval',
        });
      }, 3000);
    }
  }
}

/** Finds nodes within current page that match plugin name and given type. */
export const findNode = (response: string | ArrayLike<number>,
    type: string): Promise<any> => {
  const selection = figma.currentPage.selection[0];
  const node = figma.currentPage
    .findChild(
      n => n.name.toLowerCase() === (`${PLUGIN_NAME} ${type}`).toLowerCase()
    );

  return new Promise((resolve, reject) => {
    if (!response) {
      figma.notify(`Invalid response. Try again?`, {
        error: true,
      });
      reject();
    }

    if (selection && selection.type === type.toUpperCase()) {
      resolve(selection);
    } else if (node) {
      resolve(node);
    } else {
      reject();
    }
  });
};

/** Passes given messages to UI logger (konsole). */
export const log = (message: any = {}) => {
  figma.ui.postMessage({
    type: 'log',
    message: JSON.stringify(message),
  });
};

/** Deletes values of given keys from client storage object. */
export const deleteStorage = async (keys: Array<string>) => {
  for (const key of keys) {
    const item = await figma.clientStorage.deleteAsync(key);
    console.log(`'${key}' deleted`, item);
  }
};

/** Retrieves value of given key from client storage object. */
export const getStorage = async (key: string) => {
  const value = await figma.clientStorage.getAsync(key);

  figma.ui.postMessage({
    type: `${key}-state`,
    key,
    message: value,
  });
};

/** Sets key with given value in client storage object. */
export const setStorage = async (key: string, message: boolean) => {
  await figma.clientStorage.setAsync(key, message)
    .then(() => {
      figma.notify(`State saved!`);
    })
    .catch(() => {
      figma.notify(`Uh oh! Something went awry, state not saved.`, {
        error: true,
      });
    });
};
