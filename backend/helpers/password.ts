import bcrypt from "bcrypt";

const HASH_SALT = 10;

export function hash(str: string) {
  return bcrypt.hash(str, HASH_SALT);
}

export function compare(str: string, hashed: string) {
  return bcrypt.compare(str, hashed);
}
