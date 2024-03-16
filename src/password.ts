export function hashPassword(password: string) {
  return Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
}

export function verifyPassword(password: string, hash: string) {
  return Bun.password.verify(password, hash);
}
