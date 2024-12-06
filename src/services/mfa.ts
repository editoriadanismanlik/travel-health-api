import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class MFAService {
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex'));
    }
    return codes;
  }

  static async setupMFA(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, 'Travel Health Platform', secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCode,
      backupCodes: backupCodes.map(code => ({
        code,
        used: false
      }))
    };
  }

  static verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      return false;
    }
  }

  static verifyBackupCode(inputCode: string, backupCodes: Array<{ code: string; used: boolean }>) {
    const backupCode = backupCodes.find(
      bc => bc.code === inputCode && !bc.used
    );
    return backupCode || null;
  }

  static generateRecoveryCodes(): string[] {
    return this.generateBackupCodes();
  }
}
