export const wasActivated = (event) => {
  const keys = ["Space", "Enter"];
  if (keys.includes(event.code)) {
    event.preventDefault();
    return true;
  }
  return false;
};
