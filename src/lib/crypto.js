import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Leemos la clave hexadecimal que generaste en el .env y la pasamos a Buffer
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

export function encrypt(text) {
    const iv = crypto.randomBytes(16); // Vector de inicialización aleatorio
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}

export function decrypt(encryptedData, ivHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}