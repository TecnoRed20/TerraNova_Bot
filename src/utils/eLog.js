import timestamp from './timestamp'

export default function eLog(message, arg = "") {
  console.log(`${timestamp()} ${message}`, arg);
};