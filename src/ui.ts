import JSONFormatter from 'json-formatter-js'

const conversationButton: HTMLButtonElement =
  document.querySelector('#conversation')!;
const wdytButton: HTMLButtonElement = document.querySelector('#wdyt')!;
const statusIcon: HTMLSpanElement =
  wdytButton.querySelector('.material-symbols-outlined')!;
const questionText: HTMLTextAreaElement = document.querySelector('#question')!;
const konsoleContainer: HTMLTextAreaElement =
  document.querySelector('#konsole')!;

/**
 * Logs given messages to #konsole container.
 */
const log = (message: any = {}) => {
  const formatter = new JSONFormatter(message);

  const entry = document.createElement('span');
  entry.classList.add('konsole__entry');
  entry.appendChild(formatter.render());
  konsoleContainer.appendChild(entry);
  konsoleContainer.scrollTop = -(konsoleContainer.scrollHeight);
}

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

/**
 * Handles conversation request to intermediate ChatGPTAPI server and passing
 * result into Figma.
 */
const conversationHandler = () => {
  if (!parent) return;

  chatAPIFetch('debug')
    .then((response) => response.json())
    .then(async (data) => {
      log(data);
    });
}

/**
 * Handles message requests to intermediate ChatGPTAPI server and passing
 * results into Figma.
 */
const wdytButtonHandler = () => {
  if (!parent) return;

  const str = questionText.value;

  log(str);
  log('...awaiting response');

  questionText.disabled = true;
  statusIcon.classList.add('--pending');
  statusIcon.innerHTML = 'sync';

  chatAPIFetch('send', str)
    .then((response) => {
      log(response);
      return response.json();
    })
    .then(async (data) => {
      log(data);

      conversationButton.classList.remove('--hidden');

      const message = data.reply;
      parent.postMessage({
        pluginMessage: {
          type: 'get-response',
          message,
        }
      }, '*');
    })
    .catch((error) => {
      questionText.classList.add('--error');
      log(`Error. Make sure you're running the server by following the instructions. Also make sure you don't have an adblocker preventing requests to localhost:3000.`);
      log(error);
    })
    .finally(() => {
      questionText.disabled = false;
      window.setTimeout(() => {
        questionText.classList.remove('--error');
      }, 3000);
      statusIcon.innerHTML = 'send';
      statusIcon.classList.remove('--pending');
    });
}

conversationButton.onclick = () => {
  conversationHandler();
};

wdytButton.onclick = () => {
  wdytButtonHandler();
};

