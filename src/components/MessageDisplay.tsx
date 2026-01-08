import React from "react";

interface MessageDisplayProps {
  message: string | null;
  type: "error" | "warning" | "success" | null;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type }) => {
  if (!message) return null;

  const typeClass = type === "error" 
    ? "message-error" 
    : type === "warning" 
    ? "message-warning" 
    : "message-success";

  return (
    <div className={`message-card ${typeClass} animate-bounce-in`}>
      {message}
    </div>
  );
};