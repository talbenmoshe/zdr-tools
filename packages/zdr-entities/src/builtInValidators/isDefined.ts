import type { IViolationResult, ValidationStructure } from '../interfaces';
import { isUndefined } from 'es-toolkit/compat';

export const IS_DEFINED_METADATA_KEY = '$isDefined';

export function isDefined(): ValidationStructure<unknown, string> {
  return {
    metadata: { [IS_DEFINED_METADATA_KEY]: false },
    validator: (value?: unknown) => {
      let result: IViolationResult<string> | undefined;

      if (isUndefined(value)) {
        result = { result: IS_DEFINED_METADATA_KEY };
      }

      return result;
    }
  };
}
