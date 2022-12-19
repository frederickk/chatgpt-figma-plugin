/**
 * @fileoverview Primary plugin code.
 */

import {PLUGIN_NAME, UI} from '../globals';
import {executeEval, findNode, getStorage, setStorage} from './utils';

/** Retrieves image response data and places them on Figma canvas. */
const getImage = async (bytes: any) => {
  const img = await figma.createImage(bytes).hash;
  const fills = [{
    type: 'SOLID',
    color: {
      r: 0,
      g: 0,
      b: 0
    }
  }, {
    type: 'IMAGE',
    scaleMode: 'FIT',
    imageHash: img,
  }];

  let rect: RectangleNode;

  await findNode(bytes, 'rectangle')
    .then((node) => {
      rect = node;
      // @ts-ignore
      rect.fills = fills;
    })
    .catch(() => {
      rect = figma.createRectangle();
      rect.cornerRadius = 16;
      // @ts-ignore
      rect.fills = fills;
      rect.name = `${PLUGIN_NAME} Rectangle`;
      rect.resize(960, 960);
      rect.x = 1024;
      rect.y = 0;
    })
    .finally(() => {
      figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
    })
}

/** Retrieves response from UI message posting. */
const getResponse = async (message: string) => {
  let text: TextNode;

  await figma.loadFontAsync({
    family: 'Inter',
    style: 'Regular'
  });

  await findNode(message, 'text')
    .then((node) => {
      text = node;
      text.characters = message;
    })
    .catch(() => {
      text = figma.createText();
      text.autoRename = false;
      text.characters = message;
      text.fontSize = 48;
      text.layoutGrow = 1;
      text.name = `${PLUGIN_NAME} Text`;
      text.x = 0;
      text.y = 0;
      text.resize(960, 1024);
      // figma.currentPage.appendChild(text);
    })
    .finally(() => {
      // figma.viewport.scrollAndZoomIntoView([text]);
      figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
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
    case 'get-image':
      getImage(msg.bytes);
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
