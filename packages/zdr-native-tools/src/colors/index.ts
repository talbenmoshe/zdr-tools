import { isString } from 'es-toolkit/compat';

export * from './getColorBrightness';
export * from './isDarkColor';
export * from './convertors';

export const FULL_VALID_COLOR_REGEX = /^#[a-f0-9]{6}$/i;

export function isValidStrictHexColor(color: string) {
  return isString(color) && FULL_VALID_COLOR_REGEX.test(color);
}
