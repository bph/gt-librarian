// @ts-ignore utils is not typed in @types/remarkable
import { Remarkable, utils } from "remarkable";
import { enhanceUrl } from "./utils/utm-params";
const md = new Remarkable({
  html: true,
});

md.renderer.rules.image = function (tokens: any, idx: number) {
  const token = tokens[idx];
  return `<img src="${token.src}" alt="${token.alt}" title="${
    token.title || ""
  }" style="max-width: 100%; height: auto; display: block; margin: 1em auto;">`;
};

// based on https://github.com/jonschlinkert/remarkable/blob/7c5e433620c967618eb38cdb57360734274061c4/lib/rules.js#L148-L152
md.renderer.rules.link_open = function (tokens: any, idx: any, options: any) {
  const { escapeHtml, replaceEntities } = utils;

  const token = tokens[idx];

  // Enhance URLs with UTM parameters.
  const enhancedHref = enhanceUrl(token.href, 'response-link');

  const title = token.title ? (' title="' + escapeHtml(replaceEntities(token.title)) + '"') : '';
  var target = options?.linkTarget ? (' target="' + options.linkTarget + '"') : '';
  return '<a href="' + escapeHtml(enhancedHref) + '"' + title + target + ' class="response-a">';
};

const commonStyles = `
    :host {
        --main-color: #2271b1;
        --text-color: #FFFFFF;
        --text-size: 15px;
        --bubble-color: #2271b1;
        --reply-color: #1e1e1e;
        --reply-bubble-color: #f5f5f5;
        --reply-bubble-border: 1px solid #e5e7eb;
        --ai-bubble-color: #f3efea;
        --ai-text-color: #1e1e1e;
        --ai-sources-color: #2271b1;
        --background-color: #FFFFFF;

        --avatar-size: 32px;
        --ai-bubble-border: none;
        --ai-bubble-border-radius: 18px 18px 18px 4px;
        --reply-bubble-border-radius: 18px 18px 4px 18px;

        --bubble-max-width: 85%;
        --bubble-padding: 12px 16px;

        --notice-link-color: #2271b1;
        --notice-link-color-hover: #135e96;

        --response-link-color: #2271b1;
        --response-link-color-hover: #135e96;

        --feedback-default-color: #6b7280;
        --feedback-positive-color: #059669;
        --feedback-negative-color: #dc2626;
        --feedback-positive-hover-color: #047857;
        --feedback-negative-hover-color: #b91c1c;

        --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    #chat-content {
        width: 100%;
        height: 100%;
        overflow: auto;
        display: none;
        font-family: var(--font-family);
    }

    .error {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    .error-content {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #dc3545;
    }
`;

const widgetStyles = `
    ${commonStyles}

    @keyframes fadeIn {
        0% { opacity: 0; transform: scale(0.5); }
        100% { opacity: 1; transform: scale(1); }
    }

    @keyframes slideInUp {
        0% {
          transform: translateY(20%);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
    }

    @keyframes fadeOutDown {
        0% {
          transform: translateY(0);
          opacity: 1;
        }
        100% {
          transform: translateY(20%);
          opacity: 0;
        }
    }

    @keyframes fadeInAndMove {
        0% {
            top: initial;
            right: initial;
            width: initial;
            height: initial;
            border-radius: initial;
            opacity: 0;
        }
        100% {
            top: 0;
            right: 0;
            width: 50px;
            height: 50px;
            border-radius: 0;
            opacity: 1;
            z-index: 1000;
        }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    #chat-widget {
        display: none;
        font-family: var(--font-family);
        font-size: var(--text-size);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        border-radius: 12px;
    }

    #chat-widget.loaded {
        display: flex;
    }

    #chat-icon {
        display: flex;
        fill: var(--text-color);
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background-color: var(--main-color);
        color: var(--text-color);
        border-radius: 50%;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #chat-icon:hover {
        filter: brightness(115%);
    }

    #chat-icon .icon {
        width: 50%;
        height: 50%;
    }

    #chat-widget.open #open-icon {
        display: none;
    }

    #chat-widget.open #close-icon {
        display: inline-block;
    }

    #chat-widget:not(.open) #open-icon {
        display: inline-block;
    }

    #chat-widget:not(.open) #close-icon {
        display: none;
    }

    #chat-content {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 400px;
        height: 700px;
        max-height: calc(100vh - 110px);
        top: 20px;
        border-radius: 10px;
        background: white;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease, opacity 0.3s ease;
    }

    #chat-widget.open #chat-content {
        display: flex;
        flex-direction: column;
        animation: slideInUp 0.5s ease-out;
    }

    #chat-widget.closing #chat-content {
        animation: fadeOutDown 0.5s ease-in forwards;
    }

    #chat-header {
        background-color: var(--main-color);
        padding: 10px;
        color: var(--text-color);
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        text-align: center;
    }

    #chat-close {
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
        display: none;
        fill: var(--text-color);
        width: 20px;
    }

    #chat-clear {
        position: absolute;
        left: 10px;
        top: 10px;
        cursor: pointer;
        fill: var(--text-color);
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
    }

    #chat-clear:hover {
        filter: brightness(115%);
    }

    #chat-clear .icon {
        width: 12px;
        height: 12px;
    }

    .chat-clear-text {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-color);
        user-select: none;
    }

    .header-title {
        margin: 0;
        font-size: 1rem;
    }

    .header-subtitle {
        margin: 0;
        font-size: 0.8rem;
    }

    #support-link {
        padding: 10px;
        background-color: #f8f8f8;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: 20px;
    }

    ::slotted(*) {
        margin: 0;
        font-size: 0.7rem;
    }

    @media screen and (max-width: 768px) {
        #chat-content {
            bottom: 0;
            right: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
        }

        #chat-header {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }

        #chat-widget.open #chat-icon {
            display: none;
        }

        #chat-widget.open #chat-close {
            display: block;
        }
    }
`;

const embedStyles = `
    ${commonStyles}

    #chat-embed {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    #chat-embed.loaded .loader {
        display: none;
    }

    #chat-embed.loaded #chat-content {
        display: flex;
    }

    #chat-clear {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
        cursor: pointer;
        fill: var(--main-color);
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        background-color: rgba(255, 255, 255, 0.9);
        padding: 6px 10px;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    #chat-embed #chat-clear:hover {
        filter: brightness(115%);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    #chat-embed #chat-clear .icon {
        width: 12px;
        height: 12px;
    }

    #chat-embed .chat-clear-text {
        font-size: 12px;
        font-weight: 500;
        color: var(--main-color);
        user-select: none;
    }

    .loader {
        border: 3px solid #f3f4f6;
        border-radius: 50%;
        border-top: 3px solid var(--main-color);
        width: 36px;
        height: 36px;
        animation: spin 1s linear infinite;
        align-self: center;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const openIcon = `<svg id="open-icon" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M3 12c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H9v3l-3-3H3zM21 18c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-6v1c0 2.2-1.8 4-4 4v2c0 1.1.9 2 2 2h2v3l3-3h3z"/></g></svg>`;
const closeIcon = `<svg id="close-icon" class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg>`;
const refreshIcon = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"></path></svg>`;

export const widgetHTML = `
    <style>${widgetStyles}</style>
    <div id="chat-widget" part="widget">
        <div id="chat-icon">
            ${openIcon}
            ${closeIcon}
        </div>
        <div id="chat-content">
            <div id="chat-header">
                <h1 class="header-title"></h1>
                <p class="header-subtitle"></p>
                <div id="chat-close">
                    ${closeIcon}
                </div>
                <div id="chat-clear" title="Clear chat history" aria-label="Clear chat history">
                    ${refreshIcon}
                    <span class="chat-clear-text">Clear</span>
                </div>
            </div>
        </div>
    </div>
`;

export const embedHTML = `
    <style>${embedStyles}</style>
    <div id="chat-embed" part="widget">
        <div class="loader"></div>
        <div id="chat-clear" title="Clear chat history" aria-label="Clear chat history">
            ${refreshIcon}
            <span class="chat-clear-text">Clear</span>
        </div>
        <div id="chat-content" />
    </div>
`;

function getFeedback(messageId: number) {
  if (!messageId) return "";
  return `
        <div class="feedback">
            <svg class="feedback-icon feedback-icon-positive" fill="var(--feedback-default-color)" data-message-id=${messageId} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.22 9.55C19.79 9.04 19.17 8.75 18.5 8.75H14.47V6C14.47 4.48 13.24 3.25 11.64 3.25C10.94 3.25 10.31 3.67 10.03 4.32L7.49 10.25H5.62C4.31 10.25 3.25 11.31 3.25 12.62V18.39C3.25 19.69 4.32 20.75 5.62 20.75H17.18C18.27 20.75 19.2 19.97 19.39 18.89L20.71 11.39C20.82 10.73 20.64 10.06 20.21 9.55H20.22ZM5.62 19.25C5.14 19.25 4.75 18.86 4.75 18.39V12.62C4.75 12.14 5.14 11.75 5.62 11.75H7.23V19.25H5.62ZM17.92 18.63C17.86 18.99 17.55 19.25 17.18 19.25H8.74V11.15L11.41 4.9C11.45 4.81 11.54 4.74 11.73 4.74C12.42 4.74 12.97 5.3 12.97 5.99V10.24H18.5C18.73 10.24 18.93 10.33 19.07 10.5C19.21 10.67 19.27 10.89 19.23 11.12L17.91 18.62L17.92 18.63Z"/></svg>
            <svg class="feedback-icon feedback-icon-negative" fill="var(--feedback-default-color)" data-message-id=${messageId} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.22 9.55C19.79 9.04 19.17 8.75 18.5 8.75H14.47V6C14.47 4.48 13.24 3.25 11.64 3.25C10.94 3.25 10.31 3.67 10.03 4.32L7.49 10.25H5.62C4.31 10.25 3.25 11.31 3.25 12.62V18.39C3.25 19.69 4.32 20.75 5.62 20.75H17.18C18.27 20.75 19.2 19.97 19.39 18.89L20.71 11.39C20.82 10.73 20.64 10.06 20.21 9.55H20.22ZM5.62 19.25C5.14 19.25 4.75 18.86 4.75 18.39V12.62C4.75 12.14 5.14 11.75 5.62 11.75H7.23V19.25H5.62ZM17.92 18.63C17.86 18.99 17.55 19.25 17.18 19.25H8.74V11.15L11.41 4.9C11.45 4.81 11.54 4.74 11.73 4.74C12.42 4.74 12.97 5.3 12.97 5.99V10.24H18.5C18.73 10.24 18.93 10.33 19.07 10.5C19.21 10.67 19.27 10.89 19.23 11.12L17.91 18.62L17.92 18.63Z"/></svg>
        </div>
    `;
}

function getSources(sources: { title: string; url: string }[]) {
  const { escapeHtml } = utils;

  if (sources.length === 0) {
    return `
        <div class="sources"></div>
    `;
  }

  let sourcesList = sources
    .map(
      (source) => {
        // Enhance URLs with UTM parameters.
        const enhancedUrl = enhanceUrl(source.url, 'source-link');
        return `
        <li class="sources-li">
          <a class="sources-a" href="${escapeHtml(enhancedUrl)}" target="_blank">
            <svg class="sources-icons" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
              <path fill="currentColor" d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"></path>
            </svg>
            ${source.title}
          </a>
        </li>
      `;
      }
    )
    .join("");

  return `
      <details class="sources">
        <summary class="sources-summary">Sources</summary>
        <ul class="sources-ul">
          ${sourcesList}
        </ul>
      </details>
    `;
}

function getNotice( notice: string | null ) {
  const { escapeHtml } = utils;

  if ( notice === null ) {
    return '';
  } else if ( notice === '' ) {
    notice = '{}';
  }
  let noticeObj;
  try {
    noticeObj = JSON.parse(notice);
  } catch {
    return '';
  }
  let noticeContent = noticeObj.text ?? 'Powered by Support AI. Some responses may be inaccurate.';
  if ( noticeObj.link ) {
    const linkText = noticeObj.linkText ?? 'Learn More.';
    // Enhance URLs with UTM parameters.
    const enhancedLink = enhanceUrl(noticeObj.link, 'notice-link');
    noticeContent += ` <a href="${escapeHtml(enhancedLink)}" target="_blank" class="notice-link">${linkText}</a>`;
  }
  return `
    <div class="notice">
      ${noticeContent}
    </div>
  `;
}

export function getResponseHTML(
  text: string,
  sources: { title: string; url: string }[],
  messageId: number,
	notice: string | null
) {
  return `
    <div>
        <div class="response">
            ${md.render(text)}
        </div>
        <div class="footer">
            ${getFeedback(messageId)}
            ${getSources(sources)}
            ${getNotice(notice)}
        </div>
    </div>
  `;
}

export function getErrorHTML(message: string) {
  return `
    <div style="display: flex; justify-content: center; width: 100%;">
      <div style="display: flex; align-items: center; gap: 8px; color: #dc3545;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        ${message}
      </div>
    </div>
  `;
}
