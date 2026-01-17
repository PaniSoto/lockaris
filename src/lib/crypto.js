import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

// Añadimos 'existingIv' como segundo parámetro opcional
export function encrypt(text, existingIv = null) {
  // Si existe existingIv, lo convertimos de Hex a Buffer.
  // Si no, creamos uno nuevo aleatorio.
  const iv = existingIv
    ? Buffer.from(existingIv, "hex")
    : crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
}

export function decrypt(encryptedData, ivHex) {
  if (!encryptedData || !ivHex) return ""; // Evita errores si los campos vienen vacíos

  try {
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Error en función decrypt:", error.message);
    return "Error al descifrar";
  }
}
