import { randomUUID } from 'crypto'

export class UniqueEntityID {
  private value: string

  toString() {
    return this.value
  }

  toValue() {
    return this.value
  }

  constructor(value?: string) {
    this.value = value ?? randomUUID() // if id doens't exist create one
  }

  // compare if id is equal to another
  equals(id: UniqueEntityID) {
    return id.toValue() === this.value
  }
}
