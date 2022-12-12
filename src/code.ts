import {PLUGIN_NAME, UI} from './globals';
import {getStorage, setStorage, log} from './utils';

/** Executes given code. */
const executeEval = (str: string) => {
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

/** Retrieves response from UI message posting. */
const getResponse = async (message: string) => {
  if (!message) {
    figma.notify(`Invalid ChatGPT response given. Try again?`, {
      error: true,
    });

    return;
  }

  const selection = figma.currentPage.selection[0];
  let text = <TextNode>figma.currentPage
    .findChild(n => n.name === `${PLUGIN_NAME} Response`);

  await figma.loadFontAsync({
    family: 'Inter',
    style: 'Regular'
  })
    .then(() => {
      if (selection && selection.type === 'TEXT') {
        selection.characters = message;
      } else if (text) {
        text.characters = message;
      } else {
        text = figma.createText();
        text.autoRename = false;
        text.characters = message;
        text.fontSize = 48;
        text.layoutGrow = 1;
        text.name = `${PLUGIN_NAME} Response`;
        text.x = 0;
        text.y = 0;
        text.resize(960, 1024);
        figma.viewport.scrollAndZoomIntoView([text]);
      }
    });
};

// UI
figma.showUI(__html__, UI.size);
figma.ui.onmessage = (msg) => {

  switch (msg.type) {
    case 'close':
      figma.closePlugin();
      break;
    case 'get-eval':
      executeEval(msg.message);
      break;
    case 'get-response':
      getResponse(msg.message);
      break;
    case 'get-storage':
      getStorage(msg.key);
      break;
    case 'set-storage':
      setStorage(msg.key, msg.message);
      break;
    default:
      console.error(`Unhandled message: '${msg.type}'`);
  }
};
