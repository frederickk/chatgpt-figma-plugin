# ChatGPT Figma Plugin

v.0.3.1

### Experimental ChatGPT plugin for Figma

---
### Overview

[![Screen capture of ChatGPT Figma Plugin UI](./assets/chat-gpt-figma-plugin-simple.gif)](https://youtu.be/D6XjwKuU4PU)

This plugin is experimental and takes advantage of an [unofficial ChatGPT API](https://github.com/transitive-bullshit/chatgpt-api). As such this plugin currently only operates in "Developer mode" and could break or stop working at any time. You should be reasonably comfortable with terminal, as setup is a bit fussy.

[Watch the demo](https://youtu.be/D6XjwKuU4PU)

---
### Getting Started

**Prerequisites**

1. Create an [OpenAI account](https://auth0.openai.com/u/signup/)
2. Make sure you have **Node 18.0+** installed. I recommend [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for handling Node versioning.

**Download and Build**

1. Clone this repository into directory of your choice. `git clone https://github.com/frederickk/chatgpt-figma-plugin.git`
2. Install necessary dependencies `npm install` (you might need to run `npm install --legacy-peer-deps`)
3. Get a valid session token and a valid [clearance token](https://github.com/transitive-bullshit/chatgpt-api/issues/96) from [ChatGPT](https://chat.openai.com) (steps for getting the token are outlined [here](https://github.com/transitive-bullshit/chatgpt-api#session-tokens)), create a `.env` file, and paste the code into the file `SESSION_TOKEN="..."` and `CLEARANCE_TOKEN="..."`
4. [Build](#build) `npm run build`

**Install and Run**

1. Run the ChatGPT intermediate server `npm run serve`.
2. Load the plugin within Figma **Plugins > Development > Import plugin from manifest...**
3. Et voilà!


---
### Usage

Simply enter a question or request for [ChatGPT](https://chat.openai.com), click the **Send** (paper airplane icon) button, and (after a few seconds) the results will either:
1. spawn a new text box or
2. replace the text contents of the selected text box
3. error out... try again?

Open the **Code** panel and enter any valid [Figma Plugin API javascript](https://www.figma.com/plugin-docs/api/api-reference) you would like to execute. ⚠️ **Be careful! this is done using [`eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) and isn't the safest ⚠️**.

Open the **Console** panel to reveal a little console output so you can see what's going on behind the scenes.


---
### Build

| Command | Description |
| ------- | ----------- |
| `npm run build` | Runs Webpack build process once |
| `npm run clean` | Cleans `./build` and any cached files |
| `npm run dev`   | Runs Webpack build process and watches for changes; rebuilding as necessary |
| `npm run dev:serve` | Same as dev but with UI being accessible via [`http://localhost:8080`](http://localhost:8080) |
| `npm run serve` | Runs ChatGPT API intermediate server [`http://localhost:3000`](http://localhost:3000). **This is required for plugin to function.** |



