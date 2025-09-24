import convert from 'color-convert';

export function getColorBrightness(hexCode: string) {
  const [r, g, b] = convert.hex.rgb(hexCode);

  return (r * 299 + g * 587 + b * 114) / 1000;
};
