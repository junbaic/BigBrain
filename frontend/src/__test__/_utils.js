export const delay = async (ms = 100) => {
  return new Promise(r => setTimeout(r, ms));
}