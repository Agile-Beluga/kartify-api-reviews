module.exports.incrementIfNotExist = (obj, key, value) => {
  if (!value) return obj.hasOwnProperty(key) ? obj[key] + 1 : 1;
  return obj.hasOwnProperty(key) ? obj[key] + value : value;
};
