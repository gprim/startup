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

const displayMessages = (messages) => {
  if (!messages) return;
  const user = getCurrentUser();

  const messageContainer = document.getElementById("messages");
  messageContainer.innerHTML = "";

  for (const message of messages) {
    messageContainer.appendChild(createMessageElement(message, user));
  }
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
    p.innerText = friends.join(", ");
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

  const response = await get("/api/messages/convo");

  const convos = await response.json();

  addConvos(convos, user);

  sendMessageInput.addEventListener("keydown", async (e) => {
    if (e.keyCode !== 13 || !e.target.value) return;

    if (!currentConvoId) return;

    if (e.target.value === "joke") {
      const joke = await getRandomJoke();
      if (joke) e.target.value = joke;
    }

    const response = await post(`/api/messages/${currentConvoId}`, {
      text: e.target.value,
    });

    e.target.value = "";

    if (!response.ok) {
      alert("Something went wrong");
      return;
    }

    swapCurrentConvo(currentConvoId);
  });
})();
