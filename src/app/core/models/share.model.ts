import { FileItem } from './file.model.js';
import { User } from './user.model.js';

export type SharePermission = 'VIEW' | 'DOWNLOAD';

export interface FileShare {
  id: number;
  fileId: number;
  sharedWithUserId: number;
  permission: SharePermission;
  createdAt: string;
  updatedAt: string;
  sharedWithUser?: User;
  file?: FileItem;
}

export interface SharedWithMeItem {
  shareId: number;
  permission: SharePermission;
  sharedAt: string;
  file: FileItem;
}
