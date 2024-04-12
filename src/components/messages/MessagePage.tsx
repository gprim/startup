import { useContext, useEffect, useState } from "react";
import { FriendsList } from "./FriendsList";
import { Messages } from "./Messages";
import { AuthContext } from "../../context";
import useWebSocket, { ReadyState } from "react-use-websocket";
import type { Message } from "./MessageTypes";

export const MessagePage = () => {
  const [convoId, setConvoId] = useState("");
  const { user } = useContext(AuthContext);
  const { lastJsonMessage, readyState, sendJsonMessage } =
    useWebSocket<Message>(
      `${window.location.protocol === "http:" ? "ws" : "wss"}://${window.location.host}/messages`,
    );

  useEffect(() => {
    if (readyState !== ReadyState.OPEN || !convoId) return;
    sendJsonMessage({ type: "convo", convoId });
    console.log(convoId, "sent");
  }, [convoId, readyState]);

  if (!user) return <div>You must be logged in to message other users.</div>;

  return (
    <div className="message-page-container">
      <FriendsList setConvoId={setConvoId} user={user} />
      <Messages
        convoId={convoId}
        setConvoId={setConvoId}
        user={user}
        lastJsonMessage={lastJsonMessage}
        sendJsonMessage={
          readyState === ReadyState.OPEN ? sendJsonMessage : () => {}
        }
      />
    </div>
  );
};
