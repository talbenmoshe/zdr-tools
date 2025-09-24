import type { IReadablePropEventBroker, OptionalViolations } from '@zdr-tools/zdr-entities';
import { useReadableEventRefresher } from './useReadableEventRefresher';
import { TEXT_MIN_LENGTH_METADATA_KEY, TEXT_MAX_LENGTH_METADATA_KEY } from '@zdr-tools/zdr-entities';

export interface ITextFieldResult {
  text: string;
  minLength: number | undefined;
  maxLength: number | undefined;
  violations: OptionalViolations<string> | undefined;
}

export function useTextField(textBroker: IReadablePropEventBroker<string>): ITextFieldResult {
  const [[value, violations]] = useReadableEventRefresher(textBroker);
  const minLength = textBroker.getMetadataValue(TEXT_MIN_LENGTH_METADATA_KEY) as number | undefined;
  const maxLength = textBroker.getMetadataValue(TEXT_MAX_LENGTH_METADATA_KEY) as number | undefined;

  return {
    text: value,
    minLength,
    maxLength,
    violations
  };
}
