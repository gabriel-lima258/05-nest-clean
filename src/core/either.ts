// Error
export class Left<L, R> {
  readonly value: L // readonly can't be changed

  constructor(value: L) {
    this.value = value
  }

  // this is point to the typescript that is Right
  isRight(): this is Right<L, R> {
    return false
  }

  isLeft(): this is Left<L, R> {
    return true
  }
}

// Success
export class Right<L, R> {
  readonly value: R // readonly can't be changed

  constructor(value: R) {
    this.value = value
  }

  isRight(): this is Right<L, R> {
    return true
  }

  isLeft(): this is Left<L, R> {
    return false
  }
}

// create a type of Either
export type Either<L, R> = Left<L, R> | Right<L, R>

// function error
export const left = <L, R>(value: L): Either<L, R> => {
  return new Left(value)
}

// function success
export const right = <L, R>(value: R): Either<L, R> => {
  return new Right(value)
}
