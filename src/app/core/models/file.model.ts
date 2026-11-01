export type FileVisibility = 'PRIVATE' | 'SHARED' | 'PUBLIC';

export interface FileItem {
  id: number;
  userId: number;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  visibility: FileVisibility;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  starred?: boolean;
  user?: {
    id: number;
    email: string;
    fullName?: string;
  };
  collaborators?: {
    id: number;
    name: string;
    initials: string;
    color: string;
  }[];
}

export interface FileStatistics {
  totalFiles: number;
  totalStorageBytes: number;
  maxStorageBytes?: number;
}

export interface PreviewFile {
  id?: number;
  originalName: string;
  mimeType: string;
  size?: number;
  token?: string;
  canDownload?: boolean;
}

export interface FileListResponse {
  items: FileItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: FileStatistics;
}
