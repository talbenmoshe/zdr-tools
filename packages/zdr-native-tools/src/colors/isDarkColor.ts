import { getColorBrightness } from './getColorBrightness';

export function isDarkColor(hexColor: string) {
  const brightness = getColorBrightness(hexColor);

  return brightness < 128;
}
