const util = require('util');

const MAX_COUNT = 666;
const MIN_COUNT = 600;
const COUNT = 60;
let logs = [];
let index = 0;

const leftPad = (num) => {
  if (num > 99) {
    return num;
  }
  if (num > 9) {
    return `0${num}`;
  }
  return `00${num}`;
};

const getId = () => {
  if (index > 999) {
    index = 0;
  }
  return `${Date.now()}-${leftPad(index++)}`;
};

const log = (args, level) => {
  const msg = [];
  for (let i = 0, len = args.length; i < len; i++) {
    const arg = args[i];
    if (arg instanceof Error) {
      msg.push(arg.stack || arg);
    } else {
      msg.push(arg);
    }
  }
  logs.push({
    level,
    id: getId(),
    msg: util.format.apply(null, msg),
  });
  const len = logs.length;
  if (len > MAX_COUNT) {
    logs = logs.slice(0, len - MIN_COUNT);
  }
};

exports.log = log;
exports.getLogs = (id) => {
  id = id || String(Date.now() - 5000);
  for (let i = 0, len = logs.length; i < len; i++) {
    if (logs[i].id > id) {
      return logs.slice(i, i + COUNT);
    }
  }
  return [];
};

