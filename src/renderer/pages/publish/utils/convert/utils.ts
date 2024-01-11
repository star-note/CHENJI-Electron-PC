export const attr2str = attrs => {
  return Object.keys(attrs).reduce(
    (total, key) => `${total} ${key}="${attrs[key]}"`,
    ''
  );
};
