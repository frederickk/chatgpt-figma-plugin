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

/** Passes given messages to UI logger (konsole). */
export const log = (message: any = {}) => {
  figma.ui.postMessage({
    type: 'log',
    message: JSON.stringify(message),
  });
};