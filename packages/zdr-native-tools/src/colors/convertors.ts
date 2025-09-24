import convert from 'color-convert';

export type HSL = {
  h: number;
  s: number;
  l: number;
};

export function fromHSLtoHex(hsl: HSL) {
  const { h, s, l } = hsl;

  const hexColor = convert.hsl.hex([
    h,
    s,
    l
  ]);

  return `#${hexColor}`;
}

