export default function timestamp() {
  const padZero = (num) => (num < 10 ? `0${num}` : num);

  const now = new Date();
  const day = padZero(now.getDate());
  const month = padZero(now.getMonth() + 1); // Los meses empiezan desde 0, así que sumamos 1
  const year = now.getFullYear();
  const hours = padZero(now.getHours());
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());

  return `[${day}/${month}/${year} - ${hours}:${minutes}:${seconds}]`;
};