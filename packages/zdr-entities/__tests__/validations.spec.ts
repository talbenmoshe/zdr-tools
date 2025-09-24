import { aRandomInteger } from '@zdr-tools/zdr-native-tools';
import {
  textMinLength,
  textMaxLength,
  isDefined,
  TEXT_MIN_LENGTH_METADATA_KEY,
  TEXT_MAX_LENGTH_METADATA_KEY,
  IS_DEFINED_METADATA_KEY
} from '../src/builtInValidators';

describe('builtInValidators', () => {
  it('should have the correct min and max length constants', () => {
    // Why did you change that?
    expect(TEXT_MIN_LENGTH_METADATA_KEY).toBe('$minLength');
    expect(TEXT_MAX_LENGTH_METADATA_KEY).toBe('$maxLength');
    expect(IS_DEFINED_METADATA_KEY).toBe('$isDefined');
  });

  it('should validate min length error', () => {
    const minLength = 5;
    const validator = textMinLength(minLength);
    expect(validator.validator('1234')).toEqual({ result: TEXT_MIN_LENGTH_METADATA_KEY });
  });

  it('should validate min length metadata', () => {
    const minLength = aRandomInteger();
    const validator = textMinLength(minLength);
    expect(validator.metadata?.[TEXT_MIN_LENGTH_METADATA_KEY]).toEqual(minLength);
  });

  it('should validate min length success', () => {
    const minLength = 5;
    const validator = textMinLength(minLength);
    expect(validator.validator('12345')).toBeUndefined();
  });

  it('should validate max length metadata', () => {
    const maxLength = aRandomInteger();
    const validator = textMaxLength(maxLength);
    expect(validator.metadata?.[TEXT_MAX_LENGTH_METADATA_KEY]).toEqual(maxLength);
  });

  it('should validate max length success', () => {
    const maxLength = 5;
    const validator = textMaxLength(maxLength);
    expect(validator.validator('12345')).toBeUndefined();
  });

  it('should validate max length error', () => {
    const maxLength = 5;
    const validator = textMaxLength(maxLength);
    expect(validator.validator('123456')).toEqual({ result: TEXT_MAX_LENGTH_METADATA_KEY });
  });

  it('should validate is defined metadata', () => {
    const validator = isDefined();
    expect(validator.metadata?.[IS_DEFINED_METADATA_KEY]).toEqual(false);
  });

  it('should validate is defined success', () => {
    const validator = isDefined();
    expect(validator.validator({})).toBeUndefined();
    expect(validator.validator('123')).toBeUndefined();
    expect(validator.validator(123)).toBeUndefined();
    expect(validator.validator(null)).toBeUndefined();
  });

  it('should validate is defined error', () => {
    const validator = isDefined();
    expect(validator.validator(undefined)).toEqual({ result: IS_DEFINED_METADATA_KEY });
    // @ts-expect-error error due to validator has to get an object
    expect(validator.validator()).toEqual({ result: IS_DEFINED_METADATA_KEY });
  });
});
