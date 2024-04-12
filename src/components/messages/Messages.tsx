import { useEffect, useRef, useState, type KeyboardEventHandler } from "react";
import { Api, type User } from "../../context";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import type { Message } from "./MessageTypes";

type MessagesProps = {
  convoId: string;
  setConvoId: (newConvoId: string) => void;
  lastJsonMessage: Message;
  sendJsonMessage: SendJsonMessage;
  user?: User;
};

export const Messages = ({
  convoId,
  user,
  lastJsonMessage,
  sendJsonMessage,
}: MessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLParagraphElement>(null);

  useEffect(() => {
    if (!lastJsonMessage) return;
    messages.push(lastJsonMessage);
    setMessages([...messages]);
  }, [lastJsonMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!convoId) return;

    (async () => {
      const { ok, response } = await Api.get<Message[]>(
        `/api/messages/${convoId}`,
      );

      if (!ok || !response) {
        alert("Something went wrong");
        return;
      }

      setMessages(response.data);
    })();
  }, [convoId]);

  const createMessage = ({ from, text, timestamp }: Message) => {
    return (
      <div
        key={`${timestamp}`}
        className={from === user?.username ? "sent" : "recieved"}
      >
        <p>{text}</p>
      </div>
    );
  };

  const getRandomJoke = async () => {
    const apiKey = "oduGjzf4qa05Ng/WnXKiVA==vGHez9EAhz4zcNWo";

    const { response, ok } = await Api.get<{ joke: string }[]>(
      "https://api.api-ninjas.com/v1/jokes",
      {
        headers: { "X-Api-key": apiKey },
      },
    );

    if (!ok || !response) return "";

    return response.data[0].joke;
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    if (event.key !== "Enter" || !convoId) return;

    let text = (event.target as HTMLInputElement).value;

    if (!text) return;

    if (text === "joke") {
      const joke = await getRandomJoke();
      if (joke) text = joke;
    }

    sendJsonMessage({
      type: "message",
      message: text,
      convoId,
    });

    messages.push({
      text,
      from: user!.username,
      timestamp: Date.now(),
    });

    (event.target as HTMLInputElement).value = "";

    setMessages([...messages]);
  };

  return (
    <section className="messages-container">
      <h2>Messages</h2>
      <section className="messages">
        <div id="messages">
          {messages.map((message) => createMessage(message))}
          <p ref={messagesEndRef} />
        </div>
      </section>
      <div className="message-input-container">
        <input
          id="message-input"
          type="text"
          placeholder="Type message here"
          onKeyDown={handleKeyDown}
        />
      </div>
    </section>
  );
};
