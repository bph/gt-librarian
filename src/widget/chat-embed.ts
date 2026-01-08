import { embedHTML } from "./page";
import { ChatLogic } from "./chat-box";
import { ERROR_MESSAGE, handleError } from "./error-handler";
import { setUtmConfig } from "./utils/utm-params";
import { UTM_ATTRIBUTES } from "./constants";

export class ChatEmbed extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _chatLogic: ChatLogic | null;
  private _token: string | null;
  private _bot: string | null;
  private _avatar: string | null;
  private _firstMessage: string | null;
  private _hideInputArea: boolean = false;
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
    this._firstMessage = this.getAttribute("first-message");
    this._clearOnError = !!this.hasAttribute("clear-on-error");
    const ttlAttr = this.getAttribute("ttl");
    this._ttl = ttlAttr ? parseInt(ttlAttr, 10) : undefined;
    // Allow defaults if attribute is present with no value.
    if ( this.hasAttribute( 'notice' ) ) {
      this._notice = this.getAttribute( 'notice' );
    }

    // Configure UTM parameters if provided
    this._configureUtmParams();

    this._shadowRoot.innerHTML = embedHTML;
  }

  private _configureUtmParams() {
    const utmSource = this.getAttribute("utm-source");
    const utmMedium = this.getAttribute("utm-medium");
    const utmCampaign = this.getAttribute("utm-campaign");
    const utmTargetDomain = this.getAttribute("utm-target-domain");

    // Only configure if target domain and all UTM params are provided
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
      "first-message",
      "hide-input-area",
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
        "first-message": "_firstMessage",
        "hide-input-area": "_hideInputArea",
        "clear-on-error": "_clearOnError",
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

  setLoaded() {
    this._shadowRoot
      .querySelector<HTMLDivElement>("#chat-embed")!
      .classList.add("loaded");
  }

  load() {
    if (this._chatLogic) {
      this._chatLogic
        .load()
        .then(() => {
          this._chatLogic?.setAvatar(this._avatar!);
          this._chatLogic?.setFirstMessage(this._firstMessage!);
          this.setLoaded();
        })
        .catch((error: any) => this.handleOnLoadError(error));
    }
  }

  connectedCallback() {
    this.addEventListeners();

    this._chatLogic = new ChatLogic(
      this._shadowRoot.querySelector<HTMLDivElement>("#chat-content")!,
      this._bot!,
      this._token!,
      this._hideInputArea,
      this._notice,
      this._ttl
    );

    this.load();
  }

  private addEventListeners() {
    const chatClear =
      this._shadowRoot.querySelector<HTMLDivElement>("#chat-clear")!;
    this._shadowRoot.addEventListener("keypress", (e) => e.stopPropagation());
    chatClear.addEventListener("click", () => this.clearChat());
  }

  public clearChat() {
    if (this._chatLogic) {
      this._chatLogic.clearChat();
      this.load();
    }
  }

  private handleOnLoadError(error: Error) {
    handleError(error);
    this._clearOnError
      ? this.clearChat()
      : this._chatLogic?.setErrorMessage(ERROR_MESSAGE);
    this.setLoaded();
  }

  public sendMessage(message: string) {
    if (this._chatLogic) {
      this._chatLogic.sendMessage(message);
    }
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
