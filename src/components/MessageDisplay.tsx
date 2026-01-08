import React from "react";

interface MessageDisplayProps {
  message: string | null;
  type: "error" | "warning" | "success" | null;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type }) => {
  if (!message) return null;

  const bgColor = {
    error: "bg-destructive/20 border-destructive/50 text-destructive",
    warning: "bg-coin/20 border-coin/50 text-coin",
    success: "bg-success/20 border-success/50 text-success",
  }[type || "warning"];

  return (
    <div className={`px-4 py-2 rounded-xl border text-center ${bgColor} animate-shake`}>
      {message}
    </div>
  );
};
