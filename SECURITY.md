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
