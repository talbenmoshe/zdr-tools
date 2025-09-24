import { nanoid } from 'nanoid';

export function createSafeRandomId(length?: number): string {
  return nanoid(length);
}
