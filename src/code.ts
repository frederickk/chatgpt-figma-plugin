import {UI} from './globals';

/**
 * Retrieves response from UI message posting.
 */
const getResponse = async (message: string) => {
  console.log('getResponse', message);

  if (!message) {
    figma.notify(`Invalid ChatGPT response given. Try again?`, {
      error: true,
    });

    return;
  }

  const selection = figma.currentPage.selection[0];
  await figma.loadFontAsync({
    family: 'Inter',
    style: 'Regular'
  })
    .then(() => {
      if (selection && selection.type === 'TEXT') {
        selection.characters = message;
      } else {
        const text = figma.createText();
        text.characters = message
        text.fontSize = 48;
        text.name = 'ChatGPT Messaage';
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
    case 'get-response':
      getResponse(msg.message);
      break;
    default:
      console.error(`Unhandled message: '${msg.type}'`);
  }
};
