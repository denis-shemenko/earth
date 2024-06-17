import { useEffect, useRef, useState } from "react";

export type Message = {
  role: "human" | "ai";
  content: string;
  options: string[];
  correct: string;
  topic: string;
};

export default function useChat() {
  const [thinking, setThinking] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        process.env.NEXT_PUBLIC_CHATBOT_GREETING || "How can I help you today?",
      options: [],
      correct: "",
      topic: "",
    },
  ]);
  const container = useRef<HTMLDivElement>(null);

  const generateResponse = async (message: string): Promise<void> => {
    // Append human message
    var currentTopic = message;
    messages.push({ role: "human", content: message, options: [], correct: "", topic: currentTopic });

    // Set thinking to true
    setThinking(true);

    try {
      // Send POST message to the API
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      // Append the API message to the state
      const json = await response.json();

      messages.push({ role: "ai", content: json.message, options: json.options, correct: json.correct, topic: currentTopic });

      setMessages(messages);
    } catch (e) {
      console.error(e);
    } finally {
      setThinking(false);
    }
  };

  // Scroll latest message into view
  useEffect(() => {
    if (container.current) {
      container.current.scrollTop = container.current.scrollHeight;
    }
  }, [thinking, messages]);

  return {
    thinking,
    messages,
    container,
    generateResponse
  };
}
