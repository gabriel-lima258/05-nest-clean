import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidAttachmentTypeError extends Error implements UseCaseError {
  constructor(type: string) {
    // File type "video" is not valid.
    super(`File type "${type}" is not valid.`)
  }
}
