import { getCurrentUser } from "./account.js";
import { get, post } from "./api.js";

const createMessageElement = ({ text, from }, user) => {
  const messageDivContainer = document.createElement("div");
  messageDivContainer.className = from === user.username ? "sent" : "recieved";
  const p = document.createElement("p");
  p.textContent = text;
  messageDivContainer.appendChild(p);
  return messageDivContainer;
};

let currentConvoId = undefined;
let wsToken = "";
const messageContainer = document.getElementById("messages");

const addMessage = (messageElement) => {
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

const displayMessages = (messages) => {
  if (!messages) return;
  const user = getCurrentUser();

  messageContainer.innerHTML = "";

  for (const message of messages) {
    messageContainer.appendChild(createMessageElement(message, user));
  }
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

const createNewConvo = async (username) => {
  const response = await post(`/api/messages/convo/${username}`);

  if (!response.ok) {
    alert("Something went wrong");
    return;
  }

  return (currentConvoId = await response.text());
};

const swapCurrentConvo = async (convoId) => {
  const response = await get(`/api/messages/${convoId}`);

  const messages = await response.json();

  displayMessages(messages);
};

const friendsSearchInput = document.getElementById("friend-search");
const friendsList = document.getElementById("friend-list");

const addConvos = async (convos, user) => {
  if (!convos) return;

  friendsList.innerHTML = "";

  for (const convo of convos) {
    const p = document.createElement("p");
    const friends = convo.users.filter(
      (username) => username !== user.username,
    );

    const convoName = friends.length ? friends.join(", ") : user.username;

    p.innerText = convoName;
    const ul = document.createElement("ul");
    ul.appendChild(p);
    ul.addEventListener("click", async () => {
      currentConvoId = convo.convoId;
      await swapCurrentConvo(convo.convoId);
    });
    friendsList.appendChild(ul);
  }
};

friendsSearchInput.addEventListener("keydown", async (e) => {
  if (e.keyCode !== 13 || !e.target.value) return;

  friendsList.innerHTML = "";

  const response = await get(`/api/messages/users/${e.target.value}`);

  if (!response.ok) {
    alert("An error occured");
    return;
  }

  const friends = await response.json();

  for (const friend of friends) {
    const p = document.createElement("p");
    p.innerText = friend;
    const ul = document.createElement("ul");
    ul.appendChild(p);
    ul.addEventListener("click", async () => {
      const convoId = await createNewConvo(friend);
      await swapCurrentConvo(convoId);
    });
    friendsList.appendChild(ul);
  }
});

const getRandomJoke = async () => {
  const apiKey = "oduGjzf4qa05Ng/WnXKiVA==vGHez9EAhz4zcNWo";

  const response = await get("https://api.api-ninjas.com/v1/jokes", {
    "X-Api-key": apiKey,
  });

  if (!response.ok) return;

  return (await response.json())[0].joke;
};

(async () => {
  const sendMessageInput = document.getElementById("message-input");
  const messageContainer = document.getElementById("messages");
  const user = getCurrentUser();

  const setMaxSizeOfMessageContainer = () => {
    while (messageContainer.firstChild)
      messageContainer.removeChild(messageContainer.lastChild);
    const parentHeight = Math.floor(
      messageContainer.parentElement.getBoundingClientRect().height - 1,
    );

    messageContainer.style.maxHeight = `${parentHeight}px`;

    displayMessages();
  };

  if (!user) {
    const errorMessage = document.createElement("div");
    errorMessage.textContent = "You must be logged in to message!";
    sendMessageInput.parentElement.replaceChild(errorMessage, sendMessageInput);

    return;
  }

  setMaxSizeOfMessageContainer();

  window.addEventListener("resize", setMaxSizeOfMessageContainer);

  const protocol = window.location.protocol === "http:" ? "ws" : "wss";

  const socket = new WebSocket(
    `${protocol}://${window.location.host}/messages`,
  );

  socket.onopen = (e, ev) => {
    console.log(e, ev);
  };

  socket.onmessage = (e, ev) => {
    console.log(ev);
    if (typeof e.data !== "string") return;

    const data = JSON.parse(e.data);

    if (!wsToken) {
      wsToken = data.token;
      socket.send(JSON.stringify({ type: "token", token: wsToken }));
      return;
    }

    if (data.text) {
      addMessage(createMessageElement(data, user));
    }
  };

  socket.onclose = () => {
    console.log("closed");
    wsToken = "";
  };

  const response = await get("/api/messages/convo");

  let convos = await response.json();

  if (!convos.length) {
    await createNewConvo(user.username);
    convos = await (await get("/api/messages/convo")).json();
  }

  currentConvoId = convos[0].convoId;

  socket.send(JSON.stringify({ type: "convo", convoId: currentConvoId }));

  addConvos(convos, user);
  swapCurrentConvo(currentConvoId);

  sendMessageInput.addEventListener("keydown", async (e) => {
    if (e.keyCode !== 13 || !e.target.value) return;

    if (!currentConvoId) await createNewConvo(user.username);

    let text = e.target.value;

    e.target.value = "";

    if (text === "joke") {
      const joke = await getRandomJoke();
      if (joke) text = joke;
    }

    socket.send(JSON.stringify({ type: "message", message: text }));

    if (!response.ok) {
      alert("Something went wrong");
      return;
    }

    addMessage(createMessageElement({ text: text, from: user.username }, user));
  });
})();
