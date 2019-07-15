
export function Enum(values) {
  const obj = values.reduce((o, val) => { o[val] = val; return o }, {});
  return Object.freeze(obj);
}
