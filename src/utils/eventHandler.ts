import { KeyboardEvent } from "react";

export const wasActivated = (event: KeyboardEvent) => {
  const keys = ["Space", "Enter"];
  if (keys.includes(event.code)) {
    event.preventDefault();
    return true;
  }
  return false;
};
