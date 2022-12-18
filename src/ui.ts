import {EXAMPLE_REQS, VERSION} from './globals';
import JSONFormatter from 'json-formatter-js'

const buttonElems: { [key: string]: HTMLButtonElement; } = {
  agree: document.querySelector('#agree')!,
  debug: document.querySelector('#debug')!,
  disagree: document.querySelector('#disagree')!,
  eval: document.querySelector('#execute')!,
  wdyt: document.querySelector('#wdyt')!,
};

const containerElems: { [key: string]: HTMLElement; } = {
  disclaimer: document.querySelector('#disclaimer')!,
  konsole: document.querySelector('#konsole')!,
};

const detailsElems: { [key: string]: HTMLDetailsElement; } = {
  code: document.querySelector('#details__code')!,
  konsole: document.querySelector('#details__konsole')!,
};

const iconElems: { [key: string]: HTMLSpanElement; } = {
  eval: buttonElems.eval.querySelector('.material-symbols-outlined')!,
  wdyt: buttonElems.wdyt.querySelector('.material-symbols-outlined')!,
};

const textareaElems: { [key: string]: HTMLTextAreaElement; } = {
  eval: document.querySelector('#eval')!,
  question: document.querySelector('#question')!,
};

/**
 * Fetches requests from given endpoint of ChatGPTAPI intermediate server.
 * @param endpoint  endpoint for request type
 * @param message   optional body message
 */
const chatAPIFetch = async (endpoint: string, message: string = ''):
    Promise<Response> => {
  return fetch(`http://localhost:3000/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  })
}

/** Logs given messages to #konsole container. */
const log = (message: any = {}) => {
  const formatter = new JSONFormatter(message, 1, {
    theme: 'dark',
  });

  const entry = document.createElement('span');
  entry.classList.add('konsole__entry');
  entry.appendChild(formatter.render());
  containerElems.konsole.appendChild(entry);
  containerElems.konsole.scrollTop = -(containerElems.konsole.scrollHeight);
};

/** Triggers pending (spinning sync icon) state for given element. */
const pendingButtonActive = (elem: HTMLElement) => {
  elem.innerText = 'sync';
  elem.classList.add('--pending');
}

/** Removes pending (spinning sync icon) state from given element. */
const pendingButtonReset = (elem: HTMLElement) => {
  elem.innerText = elem.dataset.default!;
  elem.classList.remove('--pending');
}

/**
 * Handles debug request to intermediate ChatGPTAPI server and passing
 * result into Figma.
 */
const debugHandler = () => {
  if (!parent) return;

  chatAPIFetch('debug')
    .then((response) => response.json())
    .then(async (data) => {
      log(data);
    });
};

/** Handles passing of execution string into Figma. */
const evalButtonHandler = () => {
  if (!parent) return;

  const message = textareaElems.eval.value;

  if (message) {
    pendingButtonActive(iconElems.eval);

    parent.postMessage({
      pluginMessage: {
        type: 'get-eval',
        message,
      }
    }, '*');
  }
};

/**
 * Handles message requests to intermediate ChatGPTAPI server and passing
 * results into Figma.
 */
const wdytButtonHandler = () => {
  if (!parent) return;

  const str = textareaElems.question.value;

  log(str);
  log('...awaiting response');

  textareaElems.question.disabled = true;
  pendingButtonActive(iconElems.wdyt);

  chatAPIFetch('send', str)
    .then((response) => {
      log(response);
      return response.json();
    })
    .then(async (data) => {
      log(data);

      const message = data.reply;
      parent.postMessage({
        pluginMessage: {
          type: 'get-response',
          message,
        }
      }, '*');
    })
    .catch((error) => {
      textareaElems.question.classList.add('--error');
      log(`Error. Make sure you're running the server by following the instructions. Also make sure you don't have an adblocker preventing requests to localhost:3000.`);
      log(error);
    })
    .finally(() => {
      textareaElems.question.disabled = false;
      window.setTimeout(() => {
        textareaElems.question.classList.remove('--error');
      }, 3000);

      pendingButtonReset(iconElems.wdyt);
    });
};

// Event listeners.
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

buttonElems.agree.onclick = async () => {
  containerElems.disclaimer.classList.add('--hidden');

  parent.postMessage({
    pluginMessage: {
      type: 'set-storage',
      key: 'agree',
      message: true,
    }
  }, '*');
};

buttonElems.debug.onclick = () => {
  debugHandler();
};

buttonElems.disagree.onclick = () => {
  parent.postMessage({
    pluginMessage: {
      type: 'close',
      message: true,
    }
  }, '*');
};

buttonElems.eval.onclick = () => {
  evalButtonHandler();
};

buttonElems.wdyt.onclick = () => {
  wdytButtonHandler();
};

detailsElems.code.onclick = () => {
  parent.postMessage({
    pluginMessage: {
      type: 'set-storage',
      key: 'code',
      message: !detailsElems.code.open,
    }
  }, '*');
};

detailsElems.konsole.onclick = () => {
  parent.postMessage({
    pluginMessage: {
      type: 'set-storage',
      key: 'konsole',
      message: !detailsElems.konsole.open,
    }
  }, '*');
};

// Methods to run onload.
(async () => {
  // Check if user has acknowledged disclaimer.
  // TODO: Is this really the best/only way to read storageClient from the UI?
  parent.postMessage({
    pluginMessage: {
      type: 'get-storage',
      key: 'agree',
    }
  }, '*');

  // Check last open state of code expansion panel.
  // TODO: Create a more scalable means of state management.
  parent.postMessage({
    pluginMessage: {
      type: 'get-storage',
      key: 'code',
    }
  }, '*');

  // Check last open state of konsole expansion panel.
  parent.postMessage({
    pluginMessage: {
      type: 'get-storage',
      key: 'konsole',
    }
  }, '*');

  // Populate question textarea with inspirational prompts.
  textareaElems.question.innerText =
    EXAMPLE_REQS[Math.floor(Math.random() * EXAMPLE_REQS.length)];

  // Populate version number.
  document.querySelector('#version')!.innerHTML = `v${VERSION}`;
})();