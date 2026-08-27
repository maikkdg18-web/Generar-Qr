const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateShortCode(length = 7) {
  let code = ''
  const randomValues = crypto.getRandomValues(new Uint8Array(length))
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomValues[i] % ALPHABET.length]
  }
  return code
}
