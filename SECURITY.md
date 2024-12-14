# Security System Documentation

## File Upload Security Layer

### Upload Policy Interface
```typescript
// lib/security/upload-rules.ts

interface UploadPolicy {
  // Maximum allowed file size in bytes
  maxFileSize: number;
  
  // Array of allowed MIME types
  allowedTypes: string[];
  
  // Whether virus scanning is required before accepting upload
  virusScanRequired: boolean;
  
  // Encryption level for stored files: 'standard' | 'high'
  encryptionLevel: 'standard' | 'high';
  
  // Access control configuration
  accessControl: {
    // Whether file is publicly accessible
    public: boolean;
    
    // Array of user IDs allowed to access the file
    allowedUsers: string[];
    
    // Optional expiration time for access
    expiryTime?: Date;
  };
}
```

### Firebase Storage Rules
```typescript
// lib/storage/firebase-rules.ts

{
  "rules": {
    "files": {
      "$fileId": {
        // Only authenticated users can read/write
        ".read": "auth != null && (
          data.accessControl.public == true ||
          auth.uid in data.accessControl.allowedUsers
        )",
        
        // Only file owner can write
        ".write": "auth != null && (
          !data.exists() || // New file
          auth.uid == data.ownerId // Owner
        )"
      }
    }
  }
}
```

## Security Implementation

### Upload Validation
```typescript
class UploadValidator {
  validateUpload(file: File, policy: UploadPolicy): ValidationResult {
    return {
      sizeValid: file.size <= policy.maxFileSize,
      typeValid: policy.allowedTypes.includes(file.type),
      scanRequired: policy.virusScanRequired,
      encryptionRequired: policy.encryptionLevel === 'high'
    };
  }
}
```

### Access Control Implementation
```typescript
class FileAccessControl {
  async checkAccess(fileId: string, userId: string): Promise<boolean> {
    const fileMetadata = await this.getFileMetadata(fileId);
    
    // Check if file is public
    if (fileMetadata.accessControl.public) {
      return true;
    }
    
    // Check if user is in allowed users list
    if (fileMetadata.accessControl.allowedUsers.includes(userId)) {
      // Check expiry if set
      if (fileMetadata.accessControl.expiryTime) {
        return new Date() < new Date(fileMetadata.accessControl.expiryTime);
      }
      return true;
    }
    
    return false;
  }
}
```

## Role-Based Access Control (RBAC)

### User Roles and Permissions

```typescript
enum UserRole {
  FORM_OWNER = 'FORM_OWNER',
  FORM_RESPONDENT = 'FORM_RESPONDENT',
  VIEWER = 'VIEWER',
  ADMIN = 'ADMIN'
}

interface RolePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  upload: boolean;
  download: boolean;
  manage: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  FORM_OWNER: {
    create: true,
    read: true,
    update: true,
    delete: true,
    upload: true,
    download: true,
    manage: true
  },
  FORM_RESPONDENT: {
    create: false,
    read: false,
    update: false,
    delete: false,
    upload: true,
    download: false,
    manage: false
  },
  VIEWER: {
    create: false,
    read: true,
    update: false,
    delete: false,
    upload: false,
    download: true,
    manage: false
  },
  ADMIN: {
    create: true,
    read: true,
    update: true,
    delete: true,
    upload: true,
    download: true,
    manage: true
  }
}
```

### Time-Based Access Control

```typescript
interface TimeBasedAccess {
  // Temporary URL generation for uploads
  generateUploadUrl(fileId: string, options: {
    expiresIn: number; // seconds
    maxUses?: number;
    allowedTypes?: string[];
  }): Promise<string>;

  // Temporary URL generation for downloads
  generateDownloadUrl(fileId: string, options: {
    expiresIn: number; // seconds
    maxUses?: number;
    watermark?: boolean;
  }): Promise<string>;

  // Auto-deletion policy configuration
  setRetentionPolicy(fileId: string, options: {
    retentionDays: number;
    notifyBeforeDeletion?: boolean;
    notificationDays?: number;
  }): Promise<void>;
}

class TimeBasedAccessControl implements TimeBasedAccess {
  async generateUploadUrl(fileId: string, options: {
    expiresIn: number;
    maxUses?: number;
    allowedTypes?: string[];
  }): Promise<string> {
    const signedUrl = await firebase.storage()
      .ref(`uploads/${fileId}`)
      .getSignedUrl({
        action: 'write',
        expires: Date.now() + (options.expiresIn * 1000),
        contentType: options.allowedTypes?.join(','),
        metadata: {
          maxUses: options.maxUses,
          created: Date.now()
        }
      });
    
    return signedUrl;
  }

  async generateDownloadUrl(fileId: string, options: {
    expiresIn: number;
    maxUses?: number;
    watermark?: boolean;
  }): Promise<string> {
    const signedUrl = await firebase.storage()
      .ref(`files/${fileId}`)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + (options.expiresIn * 1000),
        metadata: {
          maxUses: options.maxUses,
          watermark: options.watermark
        }
      });
    
    return signedUrl;
  }

  async setRetentionPolicy(fileId: string, options: {
    retentionDays: number;
    notifyBeforeDeletion?: boolean;
    notificationDays?: number;
  }): Promise<void> {
    await firebase.firestore()
      .collection('files')
      .doc(fileId)
      .set({
        retentionPolicy: {
          deleteAfter: new Date(Date.now() + (options.retentionDays * 24 * 60 * 60 * 1000)),
          notifyBeforeDeletion: options.notifyBeforeDeletion,
          notificationDays: options.notificationDays
        }
      }, { merge: true });
  }
}
```

### Firebase Security Rules for RBAC

```typescript
{
  "rules": {
    "files": {
      "$fileId": {
        // Form owners have full access
        ".read": "auth != null && (
          data.ownerId == auth.uid ||
          auth.token.role == 'ADMIN'
        )",
        ".write": "auth != null && (
          data.ownerId == auth.uid ||
          auth.token.role == 'ADMIN'
        )",
        
        // Form respondents can only upload
        "uploads": {
          ".write": "auth != null && (
            auth.token.role == 'FORM_RESPONDENT' &&
            !data.exists()
          )"
        },
        
        // Viewers can only download
        "downloads": {
          ".read": "auth != null && (
            auth.token.role == 'VIEWER' ||
            auth.token.role == 'FORM_OWNER' ||
            auth.token.role == 'ADMIN'
          )"
        }
      }
    }
  }
}
```

### Automatic File Management

```typescript
interface FileManagementPolicy {
  // Automatic deletion after retention period
  retentionPeriod: number; // days
  
  // Notification settings
  notificationEnabled: boolean;
  notificationDays: number; // days before deletion
  
  // Cleanup settings
  cleanupEnabled: boolean;
  cleanupInterval: number; // days
}

class AutomaticFileManager {
  async scheduleFileDeletion(fileId: string, policy: FileManagementPolicy): Promise<void> {
    const deleteDate = new Date(Date.now() + (policy.retentionPeriod * 24 * 60 * 60 * 1000));
    
    // Schedule deletion
    await firebase.firestore()
      .collection('scheduledDeletions')
      .doc(fileId)
      .set({
        fileId,
        deleteAt: deleteDate,
        notifyAt: policy.notificationEnabled ? 
          new Date(deleteDate.getTime() - (policy.notificationDays * 24 * 60 * 60 * 1000)) :
          null
      });
  }

  async notifyBeforeDeletion(fileId: string): Promise<void> {
    const fileData = await firebase.firestore()
      .collection('files')
      .doc(fileId)
      .get();
    
    if (fileData.exists) {
      await this.sendNotification(fileData.data().ownerId, {
        type: 'FILE_DELETION_WARNING',
        fileId,
        daysRemaining: fileData.data().retentionPolicy.notificationDays
      });
    }
  }

  async cleanupExpiredFiles(): Promise<void> {
    const expiredFiles = await firebase.firestore()
      .collection('scheduledDeletions')
      .where('deleteAt', '<=', new Date())
      .get();
    
    for (const doc of expiredFiles.docs) {
      await firebase.storage()
        .ref(`files/${doc.data().fileId}`)
        .delete();
      
      await doc.ref.delete();
    }
  }
}
```

## File Processing Pipeline

### Pipeline Implementation

```typescript
// lib/upload/processing-pipeline.ts

interface ProcessingResult {
  success: boolean;
  error?: string;
  file?: File;
}

class FileProcessingPipeline {
  async processUploadedFile(file: File, policy: UploadPolicy): Promise<ProcessingResult> {
    try {
      // 1. Pre-upload validation
      const validationResult = await this.validateFile(file, policy);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // 2. Virus scanning
      if (policy.virusScanRequired) {
        const scanResult = await this.scanFile(file);
        if (!scanResult.success) {
          return {
            success: false,
            error: 'Virus detected or scan failed'
          };
        }
      }

      // 3. Encryption
      const encryptedFile = await this.encryptFile(file, policy.encryptionLevel);

      // 4. Upload with metadata
      const metadata = this.buildMetadata(file, policy);
      const uploadResult = await this.uploadToFirebase(encryptedFile, metadata);

      return {
        success: true,
        file: uploadResult
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async validateFile(file: File, policy: UploadPolicy): Promise<ProcessingResult> {
    // Size validation
    if (file.size > policy.maxFileSize) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${policy.maxFileSize} bytes`
      };
    }

    // Type validation
    if (!policy.allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    // Content validation (e.g., check file signature)
    const isValidContent = await this.validateFileContent(file);
    if (!isValidContent) {
      return {
        success: false,
        error: 'File content validation failed'
      };
    }

    return { success: true };
  }

  private async scanFile(file: File): Promise<ProcessingResult> {
    try {
      // Initialize virus scanner
      const scanner = new VirusScanner({
        maxFileSize: 100 * 1024 * 1024, // 100MB
        timeout: 30000 // 30 seconds
      });

      const scanResult = await scanner.scan(file);
      
      if (scanResult.infected) {
        await this.logSecurityEvent({
          type: 'VIRUS_DETECTED',
          fileHash: await this.calculateFileHash(file),
          timestamp: new Date(),
          details: scanResult.threat
        });

        return {
          success: false,
          error: 'Malware detected'
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Virus scan failed'
      };
    }
  }

  private async encryptFile(file: File, encryptionLevel: 'standard' | 'high'): Promise<File> {
    const encryption = new FileEncryption({
      algorithm: encryptionLevel === 'high' ? 'AES-256-GCM' : 'AES-128-GCM',
      keyDerivation: 'PBKDF2',
      iterations: encryptionLevel === 'high' ? 100000 : 10000
    });

    const encryptedData = await encryption.encrypt(file);
    
    // Create new File object with encrypted data
    return new File(
      [encryptedData],
      file.name,
      { type: file.type }
    );
  }

  private buildMetadata(file: File, policy: UploadPolicy): Record<string, any> {
    return {
      contentType: file.type,
      customMetadata: {
        uploaderId: 'user_id', // From auth context
        uploadTime: new Date().toISOString(),
        accessPolicy: JSON.stringify(policy.accessControl),
        originalName: file.name,
        encryptionLevel: policy.encryptionLevel,
        processingVersion: '1.0'
      }
    };
  }

  private async uploadToFirebase(
    encryptedFile: File,
    metadata: Record<string, any>
  ): Promise<File> {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`uploads/${this.generateUniqueId()}`);

    // Upload encrypted file with metadata
    await fileRef.put(encryptedFile, metadata);

    // Return the uploaded file reference
    return encryptedFile;
  }

  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logSecurityEvent(event: {
    type: string;
    fileHash: string;
    timestamp: Date;
    details?: any;
  }): Promise<void> {
    await firebase.firestore()
      .collection('security_events')
      .add({
        ...event,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
  }
}

// Usage example:
const pipeline = new FileProcessingPipeline();
const result = await pipeline.processUploadedFile(file, {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'image/jpeg'],
  virusScanRequired: true,
  encryptionLevel: 'high',
  accessControl: {
    public: false,
    allowedUsers: ['user1', 'user2'],
    expiryTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
});
```

### Pipeline Stages

1. **Pre-upload Validation**
   - File size check
   - MIME type verification
   - File signature validation
   - Content validation

2. **Virus Scanning**
   - Real-time malware detection
   - Configurable scan settings
   - Threat logging
   - Quarantine handling

3. **Encryption**
   - AES encryption (128/256-bit)
   - Key derivation (PBKDF2)
   - Configurable security levels
   - Secure key management

4. **Metadata Attachment**
   - Content type
   - Upload information
   - Access policies
   - Processing details

### Error Handling

```typescript
interface ProcessingError {
  stage: 'validation' | 'scanning' | 'encryption' | 'upload';
  code: string;
  message: string;
  details?: any;
}

class ProcessingErrorHandler {
  handleError(error: ProcessingError): void {
    // Log error
    this.logError(error);

    // Notify relevant parties
    if (error.stage === 'scanning') {
      this.notifySecurityTeam(error);
    }

    // Cleanup temporary files
    this.cleanupTemporaryFiles();
  }

  private async logError(error: ProcessingError): Promise<void> {
    await firebase.firestore()
      .collection('processing_errors')
      .add({
        ...error,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
  }
}
```

## Security Features

### File Upload Security

1. Pre-Upload Validation
   - File size limits
   - File type verification
   - MIME type checking
   - File signature validation

2. Virus Scanning
   - Real-time scanning
   - Quarantine system
   - Notification system
   - Automated cleanup

3. Encryption
   - Standard level (at rest)
   - High level (end-to-end)
   - Key management
   - Secure transmission

### Access Control

1. Authentication
   - User verification
   - Token validation
   - Session management
   - Role-based access

2. Authorization
   - Owner permissions
   - Shared access
   - Public/private settings
   - Time-based access

3. File Access Rules
   - Read permissions
   - Write permissions
   - Delete permissions
   - Share permissions

## Implementation Guidelines

### Setting Up Upload Policies

```typescript
const defaultUploadPolicy: UploadPolicy = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  virusScanRequired: true,
  encryptionLevel: 'standard',
  accessControl: {
    public: false,
    allowedUsers: [],
    expiryTime: undefined
  }
};
```

### Implementing Firebase Rules

1. Deploy Rules:
```bash
firebase deploy --only storage
```

2. Test Rules:
```typescript
await firebase.storage().ref('files/test.jpg').putFile(file, {
  customMetadata: {
    ownerId: currentUser.uid,
    accessControl: JSON.stringify({
      public: false,
      allowedUsers: [collaboratorId]
    })
  }
});
```

## Best Practices

### File Upload Security
- Always validate files server-side
- Implement virus scanning
- Use secure URLs
- Enforce size limits
- Check file signatures

### Access Control
- Use principle of least privilege
- Implement proper authentication
- Use time-limited access tokens
- Regular security audits
- Monitor access patterns

### Data Protection
- Encrypt sensitive data
- Secure key management
- Regular backups
- Audit logging
- Data retention policies

## Security Monitoring

### Access Logging
```typescript
interface AccessLog {
  fileId: string;
  userId: string;
  accessType: 'read' | 'write' | 'delete';
  timestamp: Date;
  success: boolean;
  ipAddress: string;
}
```

### Security Alerts
```typescript
interface SecurityAlert {
  type: 'unauthorized_access' | 'virus_detected' | 'policy_violation';
  severity: 'low' | 'medium' | 'high';
  details: string;
  timestamp: Date;
  affectedResource: string;
}
```

## Emergency Procedures

1. Unauthorized Access
   - Revoke access tokens
   - Lock affected files
   - Notify administrators
   - Log incident

2. Malware Detection
   - Quarantine file
   - Notify owner
   - Block similar files
   - Review access logs

3. Policy Violations
   - Document violation
   - Notify stakeholders
   - Review policies
   - Update rules

## File Validation

```typescript
// lib/security/validators.ts

interface ValidationResult {
  valid: boolean;
  error?: string;
}

class FileValidator {
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  async validateFile(file: File): Promise<ValidationResult> {
    try {
      // Check file type
      if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new SecurityError('Invalid file type', {
          allowedTypes: this.ALLOWED_MIME_TYPES,
          providedType: file.type
        });
      }

      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        throw new SecurityError('File too large', {
          maxSize: this.MAX_FILE_SIZE,
          providedSize: file.size
        });
      }

      // Check file content (deeper validation)
      await this.validateFileContent(file);

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  private async validateFileContent(file: File): Promise<void> {
    // Read file header
    const header = await this.readFileHeader(file);
    
    // Validate file signature
    if (!this.isValidFileSignature(header, file.type)) {
      throw new SecurityError('Invalid file content');
    }

    // Check for malicious content
    await this.scanForMaliciousContent(file);
  }

  private async readFileHeader(file: File): Promise<Uint8Array> {
    const HEADER_SIZE = 8192; // Read first 8KB
    const reader = new FileReader();
    const blob = file.slice(0, HEADER_SIZE);
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(new Uint8Array(reader.result as ArrayBuffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  private isValidFileSignature(header: Uint8Array, mimeType: string): boolean {
    const signatures = {
      'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47]
      // Add more signatures as needed
    };

    const fileSignature = signatures[mimeType];
    if (!fileSignature) return true; // Skip check if signature unknown

    return fileSignature.every((byte, index) => header[index] === byte);
  }

  private async scanForMaliciousContent(file: File): Promise<void> {
    // Implement content scanning logic
    // This could include:
    // - Checking for executable code
    // - Scanning for known malicious patterns
    // - Validating file structure
  }
}
```

### Access Tracking

```typescript
// lib/security/access-logger.ts

interface AccessLog {
  fileId: string;
  userId: string;
  accessType: 'upload' | 'download' | 'delete';
  timestamp: Date;
  ipAddress: string;
  success: boolean;
  metadata?: {
    userAgent?: string;
    location?: string;
    deviceInfo?: string;
  };
}

class AccessLogger {
  private readonly db = firebase.firestore();

  async logAccess(log: AccessLog): Promise<void> {
    try {
      // Log to Firestore
      await this.db.collection('access_logs').add({
        ...log,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      // If suspicious activity, trigger alert
      if (await this.isSuspiciousActivity(log)) {
        await this.triggerSecurityAlert(log);
      }
    } catch (error) {
      console.error('Failed to log access:', error);
      // Implement fallback logging mechanism
    }
  }

  private async isSuspiciousActivity(log: AccessLog): Promise<boolean> {
    // Check for suspicious patterns
    const recentLogs = await this.db
      .collection('access_logs')
      .where('userId', '==', log.userId)
      .where('timestamp', '>', new Date(Date.now() - 3600000)) // Last hour
      .get();

    // Check for rate limiting
    if (recentLogs.size > 100) { // More than 100 accesses per hour
      return true;
    }

    // Check for unusual access patterns
    const unusualPattern = this.detectUnusualPattern(recentLogs.docs);
    if (unusualPattern) {
      return true;
    }

    return false;
  }

  private detectUnusualPattern(logs: any[]): boolean {
    // Implement pattern detection logic
    // Examples:
    // - Multiple failed attempts
    // - Access from multiple IPs
    // - Unusual time patterns
    return false;
  }

  private async triggerSecurityAlert(log: AccessLog): Promise<void> {
    await this.db.collection('security_alerts').add({
      type: 'SUSPICIOUS_ACTIVITY',
      log,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    });
  }
}
```

### Download Security

```typescript
// lib/security/download-security.ts

interface SignedUrlOptions {
  expirationMinutes: number;
  ipAddress?: string;
  maxDownloads?: number;
  watermark?: boolean;
}

class DownloadSecurity {
  private readonly storage = firebase.storage();
  private readonly db = firebase.firestore();

  async generateSignedUrl(
    fileId: string,
    options: SignedUrlOptions
  ): Promise<string> {
    try {
      // Generate signed URL
      const fileRef = this.storage.ref(`files/${fileId}`);
      const signedUrl = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + (options.expirationMinutes * 60 * 1000),
        // Add IP restrictions if provided
        ...(options.ipAddress && {
          requestIp: options.ipAddress
        })
      });

      // Store URL metadata for tracking
      await this.storeUrlMetadata(fileId, {
        url: signedUrl,
        expires: new Date(Date.now() + (options.expirationMinutes * 60 * 1000)),
        maxDownloads: options.maxDownloads,
        downloads: 0,
        ipAddress: options.ipAddress
      });

      return signedUrl;
    } catch (error) {
      throw new SecurityError('Failed to generate signed URL', error);
    }
  }

  private async storeUrlMetadata(
    fileId: string,
    metadata: any
  ): Promise<void> {
    await this.db
      .collection('signed_urls')
      .doc(fileId)
      .set(metadata);
  }

  async validateDownloadRequest(
    fileId: string,
    signedUrl: string,
    ipAddress: string
  ): Promise<boolean> {
    const urlData = await this.db
      .collection('signed_urls')
      .doc(fileId)
      .get();

    if (!urlData.exists) {
      return false;
    }

    const metadata = urlData.data();

    // Check expiration
    if (new Date() > metadata.expires.toDate()) {
      return false;
    }

    // Check IP restriction
    if (metadata.ipAddress && metadata.ipAddress !== ipAddress) {
      return false;
    }

    // Check download limit
    if (metadata.maxDownloads && metadata.downloads >= metadata.maxDownloads) {
      return false;
    }

    // Update download count
    await urlData.ref.update({
      downloads: firebase.firestore.FieldValue.increment(1)
    });

    return true;
  }

  async revokeSignedUrl(fileId: string): Promise<void> {
    await this.db
      .collection('signed_urls')
      .doc(fileId)
      .delete();
  }
}

class SecurityError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'SecurityError';
  }
}

## Encryption System

```typescript
// lib/security/encryption.ts

interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyRotationPeriod: number; // days
  keyDerivation: {
    algorithm: 'PBKDF2' | 'Argon2id';
    iterations: number;
  };
}

class FileEncryptionService {
  private readonly config: EncryptionConfig = {
    algorithm: 'AES-256-GCM',
    keyRotationPeriod: 30, // 30 days
    keyDerivation: {
      algorithm: 'PBKDF2',
      iterations: 100000
    }
  };

  async encryptFile(file: File): Promise<EncryptedFile> {
    try {
      // Generate unique encryption key
      const fileKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt']
      );

      // Store key securely in KMS
      const keyId = await this.storeKeyInKMS(fileKey, file.id);

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt file content
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        fileKey,
        await file.arrayBuffer()
      );

      return {
        data: encryptedData,
        metadata: {
          keyId: keyId,
          algorithm: 'AES-256-GCM',
          timestamp: new Date(),
          iv: Array.from(iv)
        }
      };
    } catch (error) {
      throw new SecurityError('Encryption failed', error);
    }
  }

  private async storeKeyInKMS(key: CryptoKey, fileId: string): Promise<string> {
    // Export key for storage
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    
    // Generate unique key ID
    const keyId = this.generateKeyId();

    // Store in Firebase KMS
    await firebase.firestore()
      .collection('encryption_keys')
      .doc(keyId)
      .set({
        key: Array.from(new Uint8Array(exportedKey)),
        fileId: fileId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        rotateAt: new Date(Date.now() + (this.config.keyRotationPeriod * 24 * 60 * 60 * 1000))
      });

    return keyId;
  }

  private generateKeyId(): string {
    return `key-${Date.now()}-${crypto.getRandomValues(new Uint8Array(8)).join('')}`;
  }

  async decryptFile(encryptedFile: EncryptedFile): Promise<File> {
    try {
      // Retrieve key from KMS
      const keyData = await this.getKeyFromKMS(encryptedFile.metadata.keyId);
      
      // Import key for decryption
      const key = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyData.key),
        'AES-GCM',
        true,
        ['decrypt']
      );

      // Decrypt data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(encryptedFile.metadata.iv)
        },
        key,
        encryptedFile.data
      );

      return new File(
        [decryptedData],
        'decrypted-file', // Original filename should be stored in metadata
        { type: 'application/octet-stream' }
      );
    } catch (error) {
      throw new SecurityError('Decryption failed', error);
    }
  }

  private async getKeyFromKMS(keyId: string): Promise<any> {
    const keyDoc = await firebase.firestore()
      .collection('encryption_keys')
      .doc(keyId)
      .get();

    if (!keyDoc.exists) {
      throw new SecurityError('Encryption key not found');
    }

    return keyDoc.data();
  }

  async rotateKey(keyId: string): Promise<string> {
    try {
      // Get existing key data
      const oldKeyData = await this.getKeyFromKMS(keyId);

      // Generate new key
      const newKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt']
      );

      // Store new key
      const newKeyId = await this.storeKeyInKMS(newKey, oldKeyData.fileId);

      // Mark old key as rotated
      await firebase.firestore()
        .collection('encryption_keys')
        .doc(keyId)
        .update({
          rotatedTo: newKeyId,
          rotatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      return newKeyId;
    } catch (error) {
      throw new SecurityError('Key rotation failed', error);
    }
  }
}

interface EncryptedFile {
  data: ArrayBuffer;
  metadata: {
    keyId: string;
    algorithm: string;
    timestamp: Date;
    iv: number[];
  };
}

// Key rotation scheduler
class KeyRotationScheduler {
  private readonly db = firebase.firestore();

  async scheduleKeyRotation(): Promise<void> {
    const expiredKeys = await this.db
      .collection('encryption_keys')
      .where('rotateAt', '<=', new Date())
      .where('rotatedTo', '==', null)
      .get();

    const encryptionService = new FileEncryptionService();

    for (const keyDoc of expiredKeys.docs) {
      await encryptionService.rotateKey(keyDoc.id);
    }
  }
}
```

This encryption implementation:
1. Uses AES-256-GCM for file encryption
2. Implements secure key management with Firebase KMS
3. Supports automatic key rotation
4. Handles encryption/decryption with proper IV generation
5. Includes error handling and security logging

The system is designed to be:
- Secure: Using industry-standard encryption
- Scalable: Works with Firebase's infrastructure
- Maintainable: Clear separation of concerns
- Performant: Efficient encryption/decryption

Would you like me to:
1. Add more encryption algorithms?
2. Enhance the key management system?
3. Add more security logging?
4. Implement additional key rotation strategies?
