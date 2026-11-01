import { FileItem } from './file.model.js';

export interface ShareLink {
  id: number;
  fileId: number;
  token: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  publicUrl?: string;
  downloadUrl?: string;
  file?: FileItem;
}

export interface PublicFileInfo {
  fileId: number;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  expiresAt: string | null;
  downloadUrl: string;
}
