import type { IViolationResult, ValidationStructure } from '../interfaces';

export const TEXT_MIN_LENGTH_METADATA_KEY = '$minLength';

export function textMinLength(minLength: number): ValidationStructure<string, string> {
  return {
    metadata: { [TEXT_MIN_LENGTH_METADATA_KEY]: minLength },
    validator: (value?: string) => {
      let result: IViolationResult<string> | undefined;
      const length = value?.length ?? 0;

      if (length < minLength) {
        result = { result: TEXT_MIN_LENGTH_METADATA_KEY };
      }

      return result;
    }
  };
}
