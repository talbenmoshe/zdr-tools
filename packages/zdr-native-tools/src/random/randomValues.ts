export function aRandomIntegerWithRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function aRandomString() {
  return Math.random().toString(36);
}

export function aRandomStringWithLength(length: number) {
  return '1'.repeat(length);
}

export function aRandomStrictHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`.padEnd(7, '0');
}

export function aRandomInteger() {
  return Math.floor(Math.random() * 100);
}

export function aRandomBoolean() {
  return Math.random() >= 0.5;
}

export function aRandomGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);

    return v.toString(16);
  });
}

export function aRandomLanguageCode() {
  const languageCodes = [
    'en',
    'de',
    'fr',
    'es',
    'it',
    'pt',
    'nl',
    'pl',
    'ru',
    'ja',
    'ko',
    'zh',
    'ar',
    'tr',
    'he'
  ];

  return languageCodes[aRandomIntegerWithRange(0, languageCodes.length - 1)];
}

