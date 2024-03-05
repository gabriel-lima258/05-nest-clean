import { UniqueEntityID } from './unique-entity-id'

// <Props> is a generic form to access content from class entities
export abstract class Entity<Props> {
  private _id: UniqueEntityID
  protected props: Props // variable that get all props from entities

  get id() {
    return this._id
  }

  protected constructor(props: Props, id?: UniqueEntityID) {
    this.props = props
    this._id = id ?? new UniqueEntityID() // get id from Entity ID
  }

  // compare if the entity is equal to another entity
  public equals(entity: Entity<unknown>) {
    if (entity === this) {
      return true
    }

    if (entity.id === this._id) {
      return true
    }

    return false
  }
}
