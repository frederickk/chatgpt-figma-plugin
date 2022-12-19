/**
 * @fileoverview Priamry plugin UI code.
 */

import {VERSION} from '../globals';
import {buttonElems, containerElems, detailsElems, iconElems, textareaElems} from './elems';
import {log, getRandomPrompt, pendingButtonReset, postMessage, getStorageState, setStorageState} from './methods';
import {debugHandler, evalButtonHandler, imageButtonHandler, keyboardSubmitHandler, wdytButtonHandler} from './handlers';

// Run on load.
(async () => {
  // Check if user has acknowledged disclaimer.
  getStorageState('agree');

  // Check last open state of code expansion panel.
  getStorageState('code');

  // Check last open state of konsole expansion panel.
  getStorageState('konsole');

  // Populate version number.
  document.querySelector('#version')!.innerHTML = `v${VERSION}`;
})();

// Event listeners from App.
onmessage = (event) => {
  const msg = event.data.pluginMessage;

  switch (msg.type) {
    case 'agree-state':
      if (!msg.message) {
        containerElems.disclaimer.classList.remove('--hidden');
      }
      break;
    case `${msg.key}-state`:
      detailsElems[msg.key].open = msg.message;
      break;
    case 'done-eval':
      pendingButtonReset(iconElems.eval);
      break;
    case 'log':
      log(JSON.parse(msg.message));
      break;
  }
};

// Event messengers to App.
buttonElems.agree.onclick = async () => {
  containerElems.disclaimer.classList.add('--hidden');
  setStorageState('agree', true);
};

buttonElems.debug.onclick = () => {
  debugHandler();
};

buttonElems.disagree.onclick = () => {
  postMessage('close', {message: true});
};

buttonElems.eval.onclick = () => {
  evalButtonHandler();
};

buttonElems.feelingLucky.onclick = () => {
  getRandomPrompt();
};

buttonElems.lexica.onclick = () => {
  imageButtonHandler();
};

buttonElems.wdyt.onclick = () => {
  wdytButtonHandler();
};

detailsElems.code.onclick = () => {
  setStorageState('code', !detailsElems.code.open);
};

detailsElems.lexica.onclick = () => {
  setStorageState('image', !detailsElems.lexica.open);
};

detailsElems.konsole.onclick = () => {
  setStorageState('konsole', !detailsElems.konsole.open);
};

textareaElems.eval.addEventListener('keydown', (event) => {
  keyboardSubmitHandler(event as KeyboardEvent, evalButtonHandler);
});

textareaElems.lexica.addEventListener('keydown', (event) => {
  keyboardSubmitHandler(event as KeyboardEvent, imageButtonHandler);
});

textareaElems.prompt.addEventListener('keydown', (event) => {
  keyboardSubmitHandler(event as KeyboardEvent, wdytButtonHandler);
});
