import type { IViolationResult, ValidationStructure } from '../interfaces';

export const TEXT_MAX_LENGTH_METADATA_KEY = '$maxLength';

export function textMaxLength(maxLength: number): ValidationStructure<string, string> {
  return {
    metadata: { [TEXT_MAX_LENGTH_METADATA_KEY]: maxLength },
    validator: (value?: string) => {
      let result: IViolationResult<string> | undefined;
      const length = value?.length ?? 0;

      if (length > maxLength) {
        result = { result: TEXT_MAX_LENGTH_METADATA_KEY };
      }

      return result;
    }
  };
}
