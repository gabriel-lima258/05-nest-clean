import { UseCaseError } from '@/core/errors/use-case-error'

export class StudentAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    // student gabriel@gmail.com already exists
    super(`Student "${identifier}" already exists.`)
  }
}
