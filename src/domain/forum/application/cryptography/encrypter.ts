export abstract class Encrypter {
  // get payload token: object string, value unknown and return token
  abstract encrypt(payload: Record<string, unknown>): Promise<string>
}
