import "deep-chat";
import { DeepChat } from "deep-chat";
import ChatService from "./chat-service";
import { getErrorHTML, getResponseHTML } from "./page";
import { handleError } from "./error-handler";
import { DEFAULT_AVATAR } from "./constants";

export class ChatLogic {
  private static readonly DEFAULT_TTL: number = 24 * 60 * 60 * 1000; // 24 hours
  private _ttl: number;
  private _chatBot: string;
  private _chatElementRef: DeepChat | null;
  private _chatId: number | null;
  private _sessionId: string | null;
  private _chatService: ChatService;
  private _hideInputArea: boolean = false;
  private _notice: string | null;
  private _lastMessageTime: number | null = null;

  constructor(
    chatContainer: HTMLElement,
    bot: string,
    token?: string,
    hideInputArea: boolean = false,
    notice: string | null = null,
    ttl?: number
  ) {
    if (!bot) {
      throw new Error("Error initializing chat");
    }

    this._chatBot = bot;
    this._chatId = this.getChatIdFromStorage();
    this._sessionId = this.getSessionIdFromStorage();
    this._chatElementRef = document.createElement("deep-chat");
    this._chatElementRef.id = "chat-element";
    chatContainer.appendChild(this._chatElementRef);
    this._chatService = new ChatService(bot, token);
    this._hideInputArea = hideInputArea;
    this._notice = notice;
    this._ttl = ttl ?? ChatLogic.DEFAULT_TTL;
    this.initializeChat();
  }

  private initializeChat() {
    this.setupMessageHandlers();
    this.applyChatStyles();
    this.setupHtmlClassUtilities();
    this.setupOnComponentRender();
  }

  private async loadPreviousMessages() {
    if (this._chatId) {
      const result = await this._chatService.loadPreviousMessages(
        this._chatId,
        this._sessionId!
      );

      if (result.messages && result.messages.length > 0) {
        const lastMessage = result.messages[result.messages.length - 1];
        if (lastMessage.created_at) {
          this._lastMessageTime = this.parseUTCTimestamp(lastMessage.created_at);
        }
      }

      if (this.isChatExpired()) {
        this.clearChat();
        return [];
      }

      this.addMessagesToHistory(result.messages);
    }
    return [];
  }

  private async handleChatRequest(body: any, signals: any) {
    try {
      if (this.isChatExpired()) {
        signals.onResponse({
          error:
            "Chat session expired. Please clear the chat to start a new conversation.",
        });
        return;
      }

      const {
        chatId,
        sessionId,
        messageId = 0,
        content,
        sources,
      } = await this._chatService.sendMessage(
        body.messages[0].text,
        this._chatId,
        this._sessionId!
      );
      this._chatId = chatId;
      this.saveChatIdToStorage(chatId);
      this._sessionId = sessionId;
      this.saveSessionIdToStorage(sessionId);
      this._lastMessageTime = Date.now();

      signals.onResponse({
        role: "ai",
        html: getResponseHTML(content, sources, messageId, this._notice),
      });
    } catch (error: any) {
      signals.onResponse({ error: error.message });
    }
  }

  private setupMessageHandlers() {
    this._chatElementRef!.request = {
      handler: this.handleChatRequest.bind(this),
    };
  }

  private applyChatStyles() {
    this._chatElementRef!.messageStyles = this.getMessageStyles();
    this._chatElementRef!.chatStyle = this.getChatStyle();
    this._chatElementRef!.inputAreaStyle = this.getInputAreaStyle();
    this._chatElementRef!.textInput = this.getTextInputStyle();
    this._chatElementRef!.submitButtonStyles = this.getSubmitButtonStyle();
  }

  private getMessageStyles() {
    return {
      default: {
        shared: {
          innerContainer: {
            width: "var(--bubble-max-width)",
          },
          bubble: {
            padding: "var(--bubble-padding)",
            lineHeight: "1.5",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          },
        },
        user: {
          bubble: {
            borderBottomRightRadius: "0",
            border: "var(--reply-bubble-border)",
            borderRadius: "var(--reply-bubble-border-radius)",
            backgroundColor: "var(--reply-bubble-color)",
            color: "var(--reply-color)",
            overflow: "hidden",
            fontFamily: "var(--font-family)",
            fontSize: "var(--text-size)",
            marginBottom: "12px",
          },
        },
        ai: {
          bubble: {
            width: "100%",
            maxWidth: "100%",
            border: "var(--ai-bubble-border)",
            borderRadius: "var(--ai-bubble-border-radius)",
            backgroundColor: "var(--ai-bubble-color)",
            color: "var(--ai-text-color)",
            fontFamily: "var(--font-family)",
            fontSize: "var(--text-size)",
            marginBottom: "12px",
          },
        },
      },
    };
  }

  private getChatStyle() {
    return {
      border: "none",
      width: "100%",
      height: "100%",
      maxWidth: "100vw",
      backgroundColor: "#ffffff",
    };
  }

  private getInputAreaStyle() {
    return {
      display: this._hideInputArea ? "none" : "flex",
      padding: "12px 20px",
      borderTop: "1px solid #e5e7eb",
      backgroundColor: "#ffffff",
      alignItems: "center",
      gap: "12px",
    };
  }

  private getTextInputStyle() {
    return {
      styles: {
        container: {
          borderRadius: "24px",
          border: "1px solid #e5e7eb",
          width: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        },
        text: {
          padding: "12px 18px",
          fontSize: "15px",
          fontFamily: "var(--font-family)",
          color: "#1e1e1e",
          minHeight: "48px",
        },
      },
      placeholder: {
        text: "Ask me anything!",
        style: {
          color: "#9ca3af",
          fontSize: "15px",
        },
      },
    };
  }

  private getSubmitButtonStyle() {
    return {
      submit: {
        container: {
          default: {
            backgroundColor: "#2271b1",
            borderRadius: "50%",
            padding: "10px",
            width: "40px",
            height: "40px",
            minWidth: "40px",
            flexShrink: "0",
          },
          hover: {
            backgroundColor: "#135e96",
          },
          click: {
            backgroundColor: "#0a4a75",
          },
        },
        svg: {
          styles: {
            default: {
              width: "20px",
              height: "20px",
              fill: "#ffffff",
            },
          },
        },
      },
    };
  }

  private setupOnComponentRender() {
    // Ensures the last user prompt remains visible when scrolling to new messages.
    this._chatElementRef!.onNewMessage = () => {
      setTimeout(() => {
        const messages =
          this._chatElementRef!.shadowRoot!.getElementById("messages");
        const [lastUserMessage] = Array.from(
          messages!.getElementsByClassName("user-message")
        ).slice(-1) as (HTMLElement | null)[];

        if (
          !lastUserMessage ||
          messages!.scrollTop < lastUserMessage!.offsetTop
        ) {
          return;
        }

        messages!.scrollTop = lastUserMessage!.offsetTop - 5;
      });
    };
  }

  private setupHtmlClassUtilities() {
    this._chatElementRef!.htmlClassUtilities =
      this.getHtmlClassUtilities() as any;
  }

  private getHtmlClassUtilities() {
    return {
      response: {
        styles: {
          default: {
            margin: "-15px 0",
            lineHeight: "1.6",
          }
        },
      },
      "response-a": {
        styles: {
          default: {
            color: "var(--response-link-color)",
            textDecoration: "none",
            borderBottom: "1px solid var(--response-link-color)",
            transition: "all 0.2s ease",
          },
          hover: {
            color: "var(--response-link-color-hover)",
            borderBottomColor: "var(--response-link-color-hover)",
          },
        },
      },
      feedback: {
        styles: {
          default: {
            display: "flex",
            gap: "4px",
            position: "absolute",
            top: "8px",
            right: "8px",
          },
        },
      },
      "feedback-text": {
        styles: { default: { width: "calc(100% - 50px)", paddingTop: "2px" } },
      },
      "feedback-icon": {
        styles: {
          default: {
            width: "18px",
            height: "18px",
            cursor: "pointer",
            borderRadius: "4px",
            padding: "4px",
            transition: "all 0.2s ease",
          },
          hover: {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
      "feedback-icon-positive": {
        events: {
          click: (event: MouseEvent) => this.sendFeedback(true, event),
        },
        styles: {
          hover: {
            fill: "var(--feedback-positive-hover-color)",
            backgroundColor: "rgba(5, 150, 105, 0.1)",
          },
        },
      },
      "feedback-icon-negative": {
        events: {
          click: (event: MouseEvent) => this.sendFeedback(false, event),
        },
        styles: {
          default: {
            transform: "rotate(180deg)",
          },
          hover: {
            fill: "var(--feedback-negative-hover-color)",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
          },
        },
      },
      footer: {
        styles: {
          default: {
            position: "relative",
            paddingTop: "8px",
          }
        }
      },
      sources: {
        styles: {
          default: {
            margin: "16px 0 8px 0",
            color: "var(--ai-sources-color)",
            minHeight: "10px",
            fontSize: "14px",
          },
        },
      },
      "sources-summary": {
        styles: {
          default: {
            fontWeight: "600",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "6px",
            transition: "background-color 0.2s ease",
            listStylePosition: "inside",
          },
          hover: {
            backgroundColor: "rgba(34, 113, 177, 0.05)",
          },
        },
      },
      "sources-ul": {
        styles: {
          default: {
            listStyle: "none",
            padding: "8px 0 0 0",
            margin: "8px 0 0",
          },
        },
      },
      "sources-li": {
        styles: {
          default: {
            margin: "8px 0",
          }
        }
      },
      "sources-a": {
        styles: {
          default: {
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            marginLeft: "12px",
            padding: "6px 8px",
            borderRadius: "4px",
            transition: "all 0.2s ease",
          },
          hover: {
            backgroundColor: "rgba(34, 113, 177, 0.05)",
          },
        },
      },
      "sources-icons": {
        styles: {
          default: {
            width: "14px",
            height: "14px",
            marginRight: "8px",
            fill: "currentColor",
            flexShrink: "0",
          },
        },
      },
      notice: {
        styles: {
          default: {
            fontSize: "13px",
            textAlign: "left",
            color: "#6b7280",
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #e5e7eb",
          },
        },
      },
      "notice-link": {
        styles: {
          default: {
            color: "var(--notice-link-color)",
            textDecoration: "none",
            borderBottom: "1px solid transparent",
            transition: "all 0.2s ease",
          },
          hover: {
            color: "var(--notice-link-color-hover)",
            borderBottomColor: "var(--notice-link-color-hover)",
          },
        },
      },
    };
  }

  private getLocalStorageKey(type: "chat" | "session"): string {
    return `ai-widget-${this._chatBot}-${type}-id`;
  }

  private saveChatIdToStorage(chatId: number) {
    localStorage.setItem(this.getLocalStorageKey("chat"), chatId.toString());
  }

  private saveSessionIdToStorage(sessionId: string) {
    localStorage.setItem(this.getLocalStorageKey("session"), sessionId);
  }

  private getChatIdFromStorage(): number | null {
    const chatId = localStorage.getItem(this.getLocalStorageKey("chat"));
    return chatId ? parseInt(chatId, 10) : null;
  }

  private getSessionIdFromStorage(): string | null {
    const sessionId = localStorage.getItem(this.getLocalStorageKey("session"));
    return sessionId || null;
  }

  private parseUTCTimestamp(timestamp: string): number {
    // API returns timestamps in format "2025-10-17 08:25:56" (UTC)
    // Replace space with 'T' and add 'Z' to make it ISO 8601 compliant
    const isoString = timestamp.replace(' ', 'T') + 'Z';
    return new Date(isoString).getTime();
  }

  private isChatExpired(): boolean {
    if (!this._chatId || !this._lastMessageTime) {
      return false;
    }

    const now = Date.now();
    return now - this._lastMessageTime > this._ttl;
  }

  setAvatar(avatar: string) {
    // Use default avatar if none provided
    const avatarSrc = avatar || DEFAULT_AVATAR;

    this._chatElementRef!.avatars = {
      ai: {
        src: avatarSrc,
        styles: {
          avatar: {
            display: "unset",
            height: "var(--avatar-size)",
            marginTop: "-3px",
            width: "var(--avatar-size)",
            borderRadius: "6px",
          },
        },
      },
      user: { styles: { avatar: { display: "none" } } },
    };
  }

  setFirstMessage(message: string) {
    this._chatElementRef!.introMessage = { text: message };
  }

  setErrorMessage(message: string) {
    this._chatElementRef!.introMessage = {
      html: getErrorHTML(message),
    };
  }

  addMessagesToHistory(messages: any) {
    const history = messages?.map((message: any) => {
      if (message.role === "user") {
        return {
          role: "user",
          text: message.content,
        };
      }
      return {
        role: "ai",
        html: getResponseHTML(
          message.content,
          message.context.sources,
          message.message_id,
          this._notice
        ),
      };
    });
    this.setHistory(history);
  }

  clearChat() {
    try {
      this._chatElementRef!.clearMessages();
    } catch {
      this._chatElementRef!.introMessage = {
        text: this._chatElementRef!.introMessage?.text || "",
      };
    }
    this._chatId = null;
    localStorage.removeItem(this.getLocalStorageKey("chat"));
    this._sessionId = null;
    localStorage.removeItem(this.getLocalStorageKey("session"));
    this._lastMessageTime = null;
    this.setHistory([]);
  }

  sendMessage(message: string) {
    if (message.trim() === "") return;
    this._chatElementRef!.submitUserMessage({ text: message });
  }

  getChatId() {
    return this._chatId;
  }

  getMessages() {
    return this._chatElementRef!.getMessages();
  }

  isChatExpiredPublic(): boolean {
    return this.isChatExpired();
  }

  async sendFeedback(positive: boolean, event: MouseEvent) {
    const target = event.target as Element;
    // Find the SVG element with data-message-id (in case user clicked on child path element)
    const iconElement = target.closest(".feedback-icon") as Element;
    const messageId = iconElement?.getAttribute("data-message-id");
    if (!messageId || !this._chatId) return;

    const feedbackContainer = target.closest(".feedback");
    if (feedbackContainer) {
      const positiveButton = feedbackContainer.querySelector(
        ".feedback-icon-positive"
      );
      const negativeButton = feedbackContainer.querySelector(
        ".feedback-icon-negative"
      );
      if (positiveButton)
        positiveButton.setAttribute("fill", "var(--feedback-default-color)");
      if (negativeButton)
        negativeButton.setAttribute("fill", "var(--feedback-default-color)");
    }

    try {
      await this._chatService.sendFeedback(
        this._chatId,
        Number(messageId),
        positive,
        this._sessionId!
      );
      iconElement.setAttribute(
        "fill",
        positive
          ? "var(--feedback-positive-color)"
          : "var(--feedback-negative-color)"
      );
    } catch (error: any) {
      handleError(error);
    }
  }

  setHistory(history: any) {
    this._chatElementRef!.initialMessages = history;
  }

  async load() {
    await this.loadPreviousMessages();
    return;
  }
}
