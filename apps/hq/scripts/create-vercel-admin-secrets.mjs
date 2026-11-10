import { randomBytes } from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";

const rl = readline.createInterface({ input, output });
try {
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = await rl.question("Admin password (12+ characters): ");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  if (password.length < 12) throw new Error("Use a password with at least 12 characters.");
  const passwordHash = await bcrypt.hash(password, 12);
  const recoveryCodes = Array.from({ length: 10 }, () => randomBytes(5).toString("hex").toUpperCase());
  const recoveryHashes = await Promise.all(recoveryCodes.map((code) => bcrypt.hash(code, 12)));
  const totpSecret = OTPAuth.Secret.fromHex(randomBytes(20).toString("hex")).base32;
  const totp = new OTPAuth.TOTP({ issuer: "HazelSite HQ", label: email, algorithm: "SHA1", digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(totpSecret) });
  const sessionSecret = randomBytes(32).toString("hex");
  console.log("\nCopy these values directly into server-side Vercel Environment Variables. Never commit them or send them in chat.\n");
  console.log(`ADMIN_EMAIL=${email}`);
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  console.log(`ADMIN_TOTP_SECRET=${totpSecret}`);
  console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);
  console.log(`ADMIN_RECOVERY_CODE_HASHES=${JSON.stringify(recoveryHashes)}`);
  console.log(`\nAuthenticator setup URI (add it manually in your authenticator app):\n${totp.toString()}`);
  console.log(`\nOne-time recovery codes — save these privately; they are shown only once:\n${recoveryCodes.join("  ")}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Failed to create admin secrets.");
  process.exitCode = 1;
} finally {
  rl.close();
}
