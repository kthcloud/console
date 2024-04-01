export const hashGPUId = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0; // |0 is used to convert to 32bit integer
  }
  hash = Math.abs(hash) % 10000; // Ensure that the hash is a 4 digit number
  return "#" + String(hash).padStart(4, "0"); // Format the hash with leading zeroes if required
};
