import {
  storeOnLocalStorage,
  getFromLocalStorage,
  getCurrentUser,
} from "./account.js";

const getCurrentFriend = () => {
  const user = getCurrentUser();
  return getFromLocalStorage(`${user.username}-current-friend`);
};

const getMessages = () => {
  const user = getCurrentUser();
  return getFromLocalStorage(`${user.username}-messages`);
};

const storeMessages = (messages) => {
  const user = getCurrentUser();
  storeOnLocalStorage(`${user.username}-messages`, messages);
};

const setCurrentFriend = (friend) => {
  const user = getCurrentUser();
  storeOnLocalStorage(`${user.username}-current-friend`, friend);
};

const updateMessages = (friend, message) => {
  const messages = getMessages();

  if (!messages[friend]) messages[friend] = [];

  messages[friend].push(message);

  storeMessages(messages);
  displayMessages();
};

const createMessageElement = ({ text, from }, user) => {
  const messageDivContainer = document.createElement("div");
  messageDivContainer.className = from === user.username ? "sent" : "recieved";
  const p = document.createElement("p");
  p.textContent = text;
  messageDivContainer.appendChild(p);
  return messageDivContainer;
};

const displayMessages = () => {
  const currentFriend = getCurrentFriend();
  const messages = getMessages()[currentFriend] || [];
  const user = getCurrentUser();

  const messageContainer = document.getElementById("messages");
  while (messageContainer.firstChild)
    messageContainer.removeChild(messageContainer.lastChild);

  for (const message of messages) {
    messageContainer.appendChild(createMessageElement(message, user));
  }
};

(() => {
  const sendMessageInput = document.getElementById("message-input");
  const messageContainer = document.getElementById("messages");
  const user = getCurrentUser();

  if (user) setCurrentFriend("Aaron");

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

  sendMessageInput.addEventListener("keydown", (e) => {
    if (e.keyCode !== 13 || !e.target.value) return;
    const currentFriend = getCurrentFriend();

    const message = e.target.value;

    updateMessages(currentFriend, {
      text: message,
      from: user.username,
      timestamp: 0,
    });

    setTimeout(() => {
      updateMessages(currentFriend, {
        text: message,
        from: currentFriend,
        timestamp: 0,
      });
    }, 1000);

    e.target.value = "";
  });
})();
