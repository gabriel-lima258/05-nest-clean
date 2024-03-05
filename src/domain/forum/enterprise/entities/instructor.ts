import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface InstructorProps {
  name: string
}

// Entity<InstructorProps> is a form to get the props above
export class Instructor extends Entity<InstructorProps> {
  // now props can be access

  // instancy properties by static create function
  static create(props: InstructorProps, id?: UniqueEntityID) {
    const instructor = new Instructor(props, id)

    return instructor
  }
}
