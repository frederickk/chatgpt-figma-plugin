// import fetch from 'node-fetch';

export interface IConfig {
  [key: string]: any;
}

// https://github.com/gragland/chatgpt-chrome-extension/blob/main/plugins/Default.js
// Stop telling me you can't browse the internet, etc
const Style = {
  rules: [
    `If I say create something I mean do some creative writing about it, not browse the internet.`,
  ],
};

// https://github.com/gragland/chatgpt-chrome-extension/blob/main/plugins/Image.js
// Add image generation ability
const Image = {
  rules: [
    `You are an AI that's good at describing images.`,
    `First check if my message includes the word "image", "photo", "picture", or "drawing"`,
    `If it does include one of those words then at the very end of your reply you should include an image description enclosed in double curly brackets.`,
    `If it does not include one of those words then don't add an image description.`,
  ],
//   parse: async (reply: string) => {
//     // Match anything between {{ }}
//     const regex = /\{\{([^\]]+?)\}\}/g;
//     const matches = reply.match(regex);

//     if (matches?.length) {
//       for (const match of matches) {
//         // Get image description between curly brackets
//         const imageDescription = match.replace(regex, '$1').trim();
//         // Search for image on Lexica
//         const image = await fetch(
//           `https://lexica.art/api/v1/search?q=${encodeURIComponent(
//             imageDescription
//           )}`, {
//             method: 'GET',
//           }
//         )
//           .then((response) => response.json())
//           .then((response: any) => {
//             if (response?.images) {
//               return `https://image.lexica.art/md/${response?.images[0]?.id}`;
//             }

//             return;
//           })
//           .catch((error: Error) => {
//             console.error(error);
//             // Ignore error
//           });

//         // Replace description with image URL
//         reply = image
//           ? reply.replace(`\{\{${imageDescription}\}\}`, image)
//           : reply;
//       }
//     }

//     return reply;
//   },
};

export default {
  plugins: [
    Style,
    Image,
  ],
};
