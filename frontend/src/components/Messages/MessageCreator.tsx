import { useContext, useState, useRef, useEffect } from "react";
import useAuth from "../../context/useAuth";
import LongInput from "../input/LongInput";
import Button from "../Buttons/Button";
import ErrorMessage from "../input/errorMessage";
import Form from "../forms/Form";
import sendActions from "../../fetchers/sendActions";
import type { Message } from "../../pages/MessagesPage";

export default function MessageCreator({
  group = false,
  messageSentTo,
  // messages,
  username,
  setMessages,
}: {
  group: boolean;
  messageSentTo: string;
  // messages: Array<Message>;
  username: string;
  setMessages: React.Dispatch<React.SetStateAction<Array<Message>>>;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  // Get user data once and store in a ref
  const { user } = useAuth();
  const userRef = useRef(user);

  // Update ref if user changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  async function sendMessage() {
    console.log("messageSentTo", messageSentTo, username);
    const response = await sendActions.createMessage(
      content,
      messageSentTo,
      username,
      group ? "group" : "user"
    );
    console.log("response", response);
    if (response.failure === false) {
      setMessages((prevMessages) => [
        {
          id: response.id,
          createdAt: new Date().toISOString(),
          username,
          content,
          authorId: userRef.current.id,
        },
        ...prevMessages,
      ]);
      setContent("");
    } else {
      setError(response.error || "Failed to send message");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length > 500) {
      setError("Message is too long");
      return;
    } else if (content.length < 1) {
      setError("Message is too short");
      return;
    }

    await sendMessage();
  };

  return (
    <Form onSubmit={handleSubmit} className="messageCreator">
      <LongInput
        name="messageInput"
        id="messageInput"
        rows={3}
        value={content}
        setValue={setContent}
        placeholder="Type a message..."
        className="messageInput"
      />
      <ErrorMessage>{error}</ErrorMessage>
      <Button type="submit" className="messageButton" size="small">
        Send
      </Button>
    </Form>
  );
}
