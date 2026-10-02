// Cloud Backup & Password Encryption Utility

export interface BackupDataPackage {
  version: string;
  timestamp: string;
  app: string;
  salt?: string;
  iv?: string;
  encryptedData?: string;
  unencryptedData?: unknown;
}

// Key derivation from password using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function createEncryptedBackup(
  data: unknown,
  password?: string
): Promise<string> {
  const jsonStr = JSON.stringify(data);

  if (!password || password.trim() === '') {
    // Unencrypted export package
    const pkg: BackupDataPackage = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      app: 'RT-Lab-Financial-ERP',
      unencryptedData: data
    };
    return JSON.stringify(pkg, null, 2);
  }

  // Encrypted with AES-GCM
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const encryptedBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    enc.encode(jsonStr)
  );

  const pkg: BackupDataPackage = {
    version: '1.0-enc',
    timestamp: new Date().toISOString(),
    app: 'RT-Lab-Financial-ERP',
    salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuf)))
  };

  return JSON.stringify(pkg, null, 2);
}

export async function restoreEncryptedBackup(
  jsonContent: string,
  password?: string
): Promise<{ success: boolean; data?: unknown; message: string }> {
  try {
    const pkg: BackupDataPackage = JSON.parse(jsonContent);

    if (pkg.app !== 'RT-Lab-Financial-ERP') {
      return { success: false, message: 'ملف النسخة الاحتياطية غير متطابق مع منظومة معامل RT.' };
    }

    if (!pkg.encryptedData) {
      if (pkg.unencryptedData) {
        return { success: true, data: pkg.unencryptedData, message: 'تم استعادة النسخة غير المشفرة بنجاح.' };
      }
      return { success: false, message: 'الملف لا يحتوي على بيانات صالحة.' };
    }

    // Encrypted package requires password
    if (!password) {
      return { success: false, message: 'هذه النسخة محمية بكلمة مرور. يرجى إدخال كلمة المرور لفك التشفير.' };
    }

    if (!pkg.salt || !pkg.iv) {
      return { success: false, message: 'ملف النسخة الاحتياطية المشفر تالف.' };
    }

    const salt = new Uint8Array(pkg.salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const iv = new Uint8Array(pkg.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const key = await deriveKey(password, salt);

    const binaryEnc = atob(pkg.encryptedData);
    const encBytes = new Uint8Array(binaryEnc.length);
    for (let i = 0; i < binaryEnc.length; i++) {
      encBytes[i] = binaryEnc.charCodeAt(i);
    }

    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      encBytes
    );

    const dec = new TextDecoder();
    const decryptedJson = dec.decode(decryptedBuf);
    const parsedData = JSON.parse(decryptedJson);

    return {
      success: true,
      data: parsedData,
      message: 'تم فك التشفير واستعادة كامل قاعدة البيانات بنجاح!'
    };
  } catch {
    return {
      success: false,
      message: 'كلمة المرور غير صحيحة أو ملف النسخة الاحتياطية تالف!'
    };
  }
}
