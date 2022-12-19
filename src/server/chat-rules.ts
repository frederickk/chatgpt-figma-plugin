import fetch from 'node-fetch';
import {ChatResponse} from 'chatgpt';

export interface IConfig {
  [key: string]: any;
}

interface IChatResponseParse extends ChatResponse {
  imageUrl: Array<string>;
}

/** Searches given string to find string(s) that matches given RegExp. */
const findRegexMatches = async (regex: RegExp, str: string,
    callback: (str: string) => any): Promise<string[] | []> => {
  const matches = str.match(regex);
  const output: Array<string> = [];

  if (matches?.length) {
    for (const match of matches) {
      const foundStr = match.replace(regex, '$1').trim();
      const replaceStr = await callback(foundStr);
      output.push(replaceStr);

      // replace entire found string with ''
      str = str.replace(match.replace(regex, '$&'), '');
    }
  }

  return output;
}

// https://github.com/gragland/chatgpt-chrome-extension/blob/main/plugins/Default.js
// Stop telling me you can't browse the internet, etc
const Style = {
  rules: [
    `If I say create something I mean do some creative writing about it, not browse the internet.`,
    `When responding create a title summary for the reponse. Use the format "title" followed by a colon followed by your title summary`,
  ],
};

// Experiment with having semi-predictable data structures.
// const Format = {
//   rules: [
//     `Your response format should be valid JSON`,
//   ]
// }

//
const Image = {
  rules: [
    `From time to time, you should be sending an image. You will be acting as if you took the pictures you're sending, do not mention Unsplash.`,
    `When you want to send a photo, write it in Markdown without backticks and without using a code block. Use the Unsplash API (https://source.unsplash.com/random/?<PUT YOUR QUERY HERE>&w=960).`,
  ],
  parse: async (reply: IChatResponseParse) => {
    // Match urls within Markdown image tag
    const regex = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;
    const urls = await findRegexMatches(regex, reply.response, (str) => {
      return str;
    });
    reply.imageUrl = [...reply.imageUrl, ...urls];

    return reply;
  },
}

// https://github.com/gragland/chatgpt-chrome-extension/blob/main/plugins/Image.js
// Add image generation ability
const Lexica = {
  rules: [
    `You are an AI that's good at describing images.`,
    `First check if my message includes the word "image", "photo", "picture", "drawing", or "illustration"`,
    `If it does include one of those words then at the very end of your reply you should include an image description enclosed in double curly brackets.`,
    `If it does not include one of those words then don't add an image description.`,
  ],
  parse: async (reply: IChatResponseParse) => {
    // Match anything between {{ }}
    const regex = /\{\{([^\]]+?)\}\}/g;
    const urls = await findRegexMatches(regex, reply.response, async (str) => {
      const imageUrl = await fetch(
        `https://lexica.art/api/v1/search?q=${encodeURIComponent(str)}`, {
          method: 'GET',
        }
      )
      .then((response) => response.json())
      .then((response: any) => {
        if (response?.images) {
          return `https://image.lexica.art/md/${response?.images[0]?.id}`;
        }
        return;
      });

      return imageUrl;
    });
    reply.imageUrl = [...reply.imageUrl, ...urls];

    return reply;
  },
};

export default {
  plugins: [
    Style,
    // Format,
    Lexica,
    Image,
  ],
};
