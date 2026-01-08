import { widgetHTML } from "./page";
import { ChatLogic } from "./chat-box";
import { ERROR_MESSAGE, handleError } from "./error-handler";
import { setUtmConfig } from "./utils/utm-params";
import { UTM_ATTRIBUTES } from "./constants";

export class ChatWidget extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _chatLogic: ChatLogic | null;
  private _token: string | null;
  private _bot: string | null;
  private _avatar: string | null;
  private _title: string | null;
  private _subtitle: string | null;
  private _firstMessage: string | null;
  private _clearOnError: boolean = false;
  private _notice: string | null = null;
  private _ttl: number | undefined;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._chatLogic = null;
    this._token = this.getAttribute("token");
    this._bot = this.getAttribute("bot");
    this._avatar = this.getAttribute("avatar");
    this._title = this.getAttribute("title");
    this._subtitle = this.getAttribute("subtitle");
    this._firstMessage = this.getAttribute("first-message");
    this._clearOnError = !!this.hasAttribute("clear-on-error");
    const ttlAttr = this.getAttribute("ttl");
    this._ttl = ttlAttr ? parseInt(ttlAttr, 10) : undefined;
    if ( this.hasAttribute( 'notice' ) ) {
      try {
        this._notice = JSON.parse( this.getAttribute( 'notice' ) || '{}' );
      } catch {
        // Don't show a notice.
      }
      if ( this.hasAttribute( 'notice' ) ) {
        this._notice = this.getAttribute( 'notice' ) || '{}';
      }
    }

    // Configure UTM parameters if provided
    this._configureUtmParams();

    this._shadowRoot.innerHTML = widgetHTML;
  }

  private _configureUtmParams() {
    const utmSource = this.getAttribute("utm-source");
    const utmMedium = this.getAttribute("utm-medium");
    const utmCampaign = this.getAttribute("utm-campaign");
    const utmTargetDomain = this.getAttribute("utm-target-domain");

    // Only configure if target domain and all core UTM params are provided
    if (utmTargetDomain && utmSource && utmMedium && utmCampaign) {
      setUtmConfig({
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_target_domain: utmTargetDomain,
      });
    }
  }

  static get observedAttributes() {
    return [
      "token",
      "bot",
      "avatar",
      "title",
      "subtitle",
      "first-message",
      "clear-on-error",
      "notice",
      "ttl",
      ...UTM_ATTRIBUTES,
    ];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      const attributeMap: { [key: string]: string } = {
        token: "_token",
        bot: "_bot",
        avatar: "_avatar",
        title: "_title",
        subtitle: "_subtitle",
        "first-message": "_firstMessage",
        notice: "_notice",
      };

      const propertyName = attributeMap[name];
      if (propertyName) {
        (this as any)[propertyName] = newValue;
      }

      // Reconfigure UTM params when any UTM attribute changes
      if (UTM_ATTRIBUTES.includes(name)) {
        this._configureUtmParams();
      }
    }
  }

  setTitle(title: string) {
    this._shadowRoot.querySelector<HTMLHeadingElement>(
      ".header-title"
    )!.textContent = title;
  }

  setSubtitle(subtitle: string) {
    this._shadowRoot.querySelector<HTMLParagraphElement>(
      ".header-subtitle"
    )!.textContent = subtitle;
  }

  setLoaded() {
    this._shadowRoot
      .querySelector<HTMLDivElement>("#chat-widget")!
      .classList.add("loaded");
  }

  load() {
    if (this._chatLogic) {
      this._chatLogic
        ?.load()
        .then(() => {
          this._chatLogic?.setAvatar(this._avatar!);
          this._chatLogic?.setFirstMessage(this._firstMessage!);
          this.setSupportLink();
          this.setTitle(this._title!);
          this.setSubtitle(this._subtitle!);
          this.setLoaded();
        })
        .catch((error) => this.handleOnLoadError(error));
    }
  }

  setSupportLink() {
    const supportLink = document.createElement("div");
    supportLink.id = "support-link";
    const supportLinkSlot = document.createElement("slot");
    supportLinkSlot.name = "support-link";
    supportLink.appendChild(supportLinkSlot);
    this._shadowRoot
      .querySelector<HTMLDivElement>("#chat-content")!
      .appendChild(supportLink);
  }

  connectedCallback() {
    this.addEventListeners();

    this._chatLogic = new ChatLogic(
      this._shadowRoot.querySelector<HTMLDivElement>("#chat-content")!,
      this._bot!,
      this._token!,
      false,
      this._notice,
      this._ttl
    );

    this._chatLogic
      ?.load()
      .then(() => {
        this._chatLogic?.setAvatar(this._avatar!);
        this._chatLogic?.setFirstMessage(this._firstMessage!);
        this.setSupportLink();
        this.setTitle(this._title!);
        this.setSubtitle(this._subtitle!);
        this.setLoaded();
      })
      .catch((error) => {
        handleError(error);
        this._chatLogic?.setErrorMessage(
          "We failed to load the chat. Please try again later or start a new chat."
        );
        this.setTitle(this._title!);
        this.setSubtitle(this._subtitle!);
        this.setLoaded();
      });
  }

  private addEventListeners() {
    const chatIcon =
      this._shadowRoot.querySelector<HTMLDivElement>("#chat-icon")!;
    const chatClose =
      this._shadowRoot.querySelector<HTMLDivElement>("#chat-close")!;
    const chatClear =
      this._shadowRoot.querySelector<HTMLDivElement>("#chat-clear")!;

    this._shadowRoot.addEventListener("keypress", (e) => e.stopPropagation());
    chatIcon.addEventListener("click", () => this.toggleChat());
    chatClose.addEventListener("click", () => this.toggleChat());
    chatClear.addEventListener("click", () => this.clearChat());
  }

  private toggleChat() {
    const chatWidget =
      this._shadowRoot.querySelector<HTMLDivElement>("#chat-widget")!;
    if (chatWidget.classList.contains("open")) {
      chatWidget.classList.add("closing");
      setTimeout(() => {
        chatWidget.classList.remove("open", "closing");
      }, 500);
    } else {
      chatWidget.classList.add("open");
    }
  }

  private clearChat() {
    if (this._chatLogic) {
      this._chatLogic.clearChat();
      this.load();
    }
  }

  private handleOnLoadError(error: Error) {
    handleError(error);
    this.setTitle(this._title!);
    this.setSubtitle(this._subtitle!);
    this._clearOnError
      ? this.clearChat()
      : this._chatLogic?.setErrorMessage(ERROR_MESSAGE);
    this.setLoaded();
  }

  public getChatId() {
    if (this._chatLogic) {
      return this._chatLogic.getChatId();
    }
    return null;
  }

  public getMessages() {
    if (this._chatLogic) {
      return this._chatLogic.getMessages();
    }
    return [];
  }

  public isChatExpired(): boolean {
    if (this._chatLogic) {
      return this._chatLogic.isChatExpiredPublic();
    }
    return false;
  }
}
