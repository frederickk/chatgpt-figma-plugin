import {UI} from './globals';

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
      if (selection.type === 'TEXT') {
        console.log('getResponse: figma.currentPage.selection[0]');
        selection.characters = message;
      } else {
        console.log('getResponse: figma.createText()');
        const text = figma.createText();
        text.characters = message
        text.name = 'ChatGPT Messaage';
        text.x = 0;
        text.y = 0;
        figma.viewport.scrollAndZoomIntoView([text]);
      }
    });
};

const getConversation = () => {
//   return conversation;
};

// UI
figma.showUI(__html__, UI.size);

figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'get-response':
      getResponse(msg.message);
      break;
    case 'get-conversation':
      getConversation();
      break;
    default:
      console.error(`Unhandled message: '${msg.type}'`);
  }
};
