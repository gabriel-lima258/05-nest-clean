export abstract class ValueObject<Props> {
  protected props: Props // variable that get all props from object

  protected constructor(props: Props) {
    this.props = props
  }

  public equals(vo: ValueObject<unknown>) {
    if (vo === null || vo === undefined) {
      return false
    }

    if (vo.props === undefined) {
      return false
    }

    // verify if the value object is equal to another
    return JSON.stringify(vo.props) === JSON.stringify(this.props)
  }
}
