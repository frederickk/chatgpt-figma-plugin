import {ChatGPTAPI, ChatGPTAPIBrowser} from 'chatgpt';
import {IConfig} from './chat-rules';

/**
 * Configures ChatGPTAPI with given parameters.
 */
export class ChatConfigure {
  private parsers_: any[] = [];
  private api_!: ChatGPTAPI | ChatGPTAPIBrowser;

  public conversationId: string = '';
  public messageId: string = '';
  public rules: any[] = [];

  constructor({plugins}: IConfig, api: ChatGPTAPI | ChatGPTAPIBrowser) {
    this.api_ = api;

    // Collect rules and parsers from all plugins
    for (const plugin of plugins) {
      if (plugin.rules) {
        this.rules = this.rules.concat(plugin.rules);
      }
      if (plugin.parse) {
        this.parsers_.push(plugin.parse);
      }
    }
  }

  /** Runs the ChatGPT response through all plugin parsers. */
  public async parse(reply: any) {
    for (const parser of this.parsers_) {
      reply = await parser(reply);
    }

    return reply;
  };

  /** Sends ChatGPT a training message that includes all plugin rules. */
  public async train() {
    if (!this.rules.length) return;

    const message = `
      Please follow these rules when replying to me:
      ${this.rules.map((rule) => `\n- ${rule}`)}
    `;
    const reply = await this.api_.sendMessage(message);
    this.conversationId = reply.conversationId;
    this.messageId = reply.messageId;

    return reply;
  };
}
