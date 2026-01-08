import { CustomError } from "./error-handler";

async function fetchData(
  endpoint: string,
  method = "GET",
  body: any = null,
  token?: string
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (method === "POST" && body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(
      `https://public-api.wordpress.com/wpcom/v2/${endpoint}`,
      options
    );
    if (!response.ok) {
      if (response.status === 429) {
        throw new CustomError(
          "Rate limit exceeded",
          "Please try again later",
          "RATE_LIMIT"
        );
      }
      if (response.status === 403) {
        throw new CustomError(
          "Request failed",
          `Status: ${response.status}`,
          "REQUEST_UNAUTHORIZED"
        );
      }
      throw new CustomError(
        "Request failed",
        `Status: ${response.status}`,
        "REQUEST_FAILED"
      );
    }
    return await response.json();
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError("Request failed", error.message, "UNKNOWN_ERROR");
  }
}

class ChatService {
  private token?: string;
  private bot: string;

  constructor(bot: string, token?: string) {
    this.token = token;
    this.bot = bot;
  }

  async loadPreviousMessages(chatId: number, sessionId?: string) {
    const data = await fetchData(
      `odie/chat/${this.bot}/${chatId}?${
        sessionId ? `&session_id=${sessionId}` : ""
      }`,
      "GET",
      null,
      this.token
    );
    return data;
  }

  async sendMessage(
    message: string,
    chatId: number | null,
    sessionId?: string
  ) {
    const body = { message, session_id: sessionId };
    const data = await fetchData(
      `odie/chat/${this.bot}/${chatId || ""}`,
      "POST",
      body,
      this.token
    );
    if (!data) {
      throw new CustomError(
        "Failed to update chat session",
        "No response data"
      );
    }
    return {
      chatId: data.chat_id,
      sessionId: data.session_id,
      messageId: data.messages[0]?.message_id,
      content: data?.messages[0]?.content,
      sources: data.messages[0].context.sources,
    };
  }

  async sendFeedback(
    chatId: number,
    messageId: number,
    feedback: boolean,
    sessionId?: string
  ) {
    const body = {
      rating_value: feedback ? 1 : 0,
      session_id: sessionId,
    };
    if (!chatId || !messageId) {
      throw new CustomError(
        "Failed to send feedback",
        "No chat ID or message ID"
      );
    }
    return await fetchData(
      `odie/chat/${this.bot}/${chatId}/${messageId}/feedback?`,
      "POST",
      body,
      this.token
    );
  }
}

export default ChatService;
