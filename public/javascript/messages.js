import { getCurrentUser, getCurrentToken } from "./account.js";
import { get, post } from "./api.js";

const createMessageElement = ({ text, from }, user) => {
  const messageDivContainer = document.createElement("div");
  messageDivContainer.className = from === user.username ? "sent" : "recieved";
  const p = document.createElement("p");
  p.textContent = text;
  messageDivContainer.appendChild(p);
  return messageDivContainer;
};

let currentFriend = undefined;

const displayMessages = (messages) => {
  if (!messages) return;
  const user = getCurrentUser();

  const messageContainer = document.getElementById("messages");
  messageContainer.innerHTML = "";

  for (const message of messages) {
    messageContainer.appendChild(createMessageElement(message, user));
  }
};

const swapCurrentConvo = async (username) => {
  const token = getCurrentToken();
  const response = await get(`/api/messages/convo/${username}`, {
    authorization: token,
  });

  if (!response.ok) {
    alert("Something went wrong");
    return;
  }

  const messages = await response.json();

  currentFriend = username;

  displayMessages(messages);
};

const friendsSearchInput = document.getElementById("friend-search");
const friendsList = document.getElementById("friend-list");

friendsSearchInput.addEventListener("keydown", async (e) => {
  if (e.keyCode !== 13 || !e.target.value) return;

  friendsList.innerHTML = "";
  const token = getCurrentToken();

  const response = await get(`/api/messages/users/${e.target.value}`, {
    authorization: token,
  });

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
    ul.addEventListener("click", () => swapCurrentConvo(friend));
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

(() => {
  const sendMessageInput = document.getElementById("message-input");
  const messageContainer = document.getElementById("messages");
  const user = getCurrentUser();
  const token = getCurrentToken();

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

  sendMessageInput.addEventListener("keydown", async (e) => {
    if (e.keyCode !== 13 || !e.target.value) return;

    if (e.target.value === "joke") {
      const joke = await getRandomJoke();
      if (joke) e.target.value = joke;
    }

    const response = await post(
      `/api/messages/convo/${currentFriend}`,
      { text: e.target.value },
      { authorization: token },
    );

    e.target.value = "";

    if (!response.ok) {
      alert("Something went wrong");
      return;
    }
  });
})();
