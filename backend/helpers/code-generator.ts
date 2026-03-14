export default function randomCode(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    code += chars[index];
  }

  return code;
}
