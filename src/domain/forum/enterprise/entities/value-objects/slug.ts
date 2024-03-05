export class Slug {
  public value: string

  private constructor(value: string) {
    this.value = value
  }

  // use when a pass a new slug already formatted
  static create(slug: string) {
    return new Slug(slug)
  }

  /**
   * Receives a string and normalize it as a slug.
   *
   * Example: "An example title" => "an-example-title"
   *
   * @param text {string}
   */
  static createFromText(text: string) {
    const slugText = text
      .normalize('NFKD')
      .toLowerCase()
      .trim() // remove spaces of string on left and right
      .replace(/\s+/g, '-') // remove blank spaces between words
      .replace(/[^\w-]+/g, '') // catch everything that ins't words
      .replace(/_/g, '-') // remove all _ and get -
      .replace(/--+/g, '-') // remove all -- or more and get -
      .replace(/-$/g, '') // if in the end of title get - remove

    return new Slug(slugText)
  }
}
