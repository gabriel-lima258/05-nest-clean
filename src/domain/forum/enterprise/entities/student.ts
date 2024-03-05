import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface StudentProps {
  name: string
  email: string
  password: string
}

// Entity<StudentProps> is a form to get the props above
export class Student extends Entity<StudentProps> {
  // now props can be access
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  // instancy properties by static create function
  static create(
    props: StudentProps, // createdAt is optional
    id?: UniqueEntityID,
  ) {
    const student = new Student(props, id)

    return student
  }
}
