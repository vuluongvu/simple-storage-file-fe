export interface FolderItem {
  id: number;
  userId: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  fileCount?: number;
  breadcrumbs?: { id: number; name: string }[];
}
