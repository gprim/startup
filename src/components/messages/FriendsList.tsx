import { useEffect, useState, type KeyboardEventHandler } from "react";
import { Api, type User } from "../../context";
import type { Convo } from "./MessageTypes";

type FriendsListProps = {
  setConvoId: (newConvoId: string) => void;
  user?: User;
};

export const FriendsList = ({ setConvoId, user }: FriendsListProps) => {
  const [allConvos, setAllConvos] = useState<Convo[]>([]);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [otherUsers, setOtherUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { response, ok } = await Api.get<Convo[]>("/api/messages/convo");

      if (!response || !ok) {
        alert("Convos could not be retrieved");
        return;
      }

      if (response.data.length) {
        setConvoId(response.data[0].convoId);
        setConvos(response.data);
        setAllConvos(response.data);
      } else {
        const { response, ok } = await Api.post<string>(
          `/api/messages/convo/${user.username}`,
        );

        if (!response || !ok) {
          alert("Convo could not be created, please refresh the page");
          return;
        }

        setConvoId(response.data);
        setConvos([{ users: [user.username], convoId: response.data }]);
        setAllConvos([{ users: [user.username], convoId: response.data }]);
      }
    })();
  }, []);

  const userSelected = async (username: string) => {
    const { response, ok } = await Api.post<string>(
      `/api/messages/convo/${username}`,
    );

    if (!response || !ok) {
      alert("Convo could not be created");
      return;
    }

    setConvoId(response.data);

    alert(`New convo created with ${username}`);
  };

  const newConvoItem = (convo: Convo) => {
    let convoName: string = convo.users
      .filter((username) => username !== user!.username)
      .join(", ");

    if (!convoName) convoName = user!.username;

    return (
      <ul key={convo.convoId} onClick={() => setConvoId(convo.convoId)}>
        <p>{convoName}</p>
      </ul>
    );
  };

  const newUserItem = (username: string) => {
    return (
      <ul key={username} onClick={() => userSelected(username)}>
        <p>{username}</p>
      </ul>
    );
  };

  const searchConvos: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== "Enter") return;

    const usersToSearch = (event.target as HTMLInputElement).value;

    const terms = usersToSearch.split(/, +/);

    setConvos(
      allConvos.filter((convo) =>
        terms.every((term) =>
          convo.users.some((username) => username.includes(term)),
        ),
      ),
    );
  };

  const searchUsers: KeyboardEventHandler<HTMLInputElement> = async (event) => {
    if (event.key !== "Enter") return;

    const searchTerm = (event.target as HTMLInputElement).value;

    const { response, ok } = await Api.get<string[]>(
      `/api/messages/users/${searchTerm}`,
    );

    if (!response || !ok) {
      alert("Search could not be completed");
      return;
    }

    setOtherUsers(response.data);
  };

  return (
    <section className="friend-list">
      <input
        id="convo-search"
        type="text"
        placeholder="Search for existing convos"
        onKeyDown={searchConvos}
      />
      <menu id="convo-list">{convos.map((convo) => newConvoItem(convo))}</menu>
      <hr />
      <input
        id="friend-search"
        type="text"
        placeholder="Search for new friends"
        onKeyDown={searchUsers}
      />
      <menu id="friend-list">
        {otherUsers.map((username) => newUserItem(username))}
      </menu>
    </section>
  );
};
