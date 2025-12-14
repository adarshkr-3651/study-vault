export type ResourceType = 'pdf' | 'video' | 'image' | 'audio' | 'note' | 'archive' | 'software' | 'code' | 'other';

export type Visibility = 'private' | 'shared' | 'public';

export type UserRole = 'admin' | 'contributor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  course?: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  file_key: string;
  folder_id: string | null;
  owner_id: string;
  type: ResourceType;
  mime_type: string;
  size: number;
  checksum?: string;
  tags: string[];
  description?: string;
  course?: string;
  semester?: string;
  year?: string;
  visibility: Visibility;
  shared_with: string[];
  created_at: string;
  updated_at: string;
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
  resources?: Resource[];
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<ResourceType, { count: number; size: number }>;
}

export const getResourceTypeFromMime = (mimeType: string, fileName: string): ResourceType => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType.startsWith('application/pdf')) return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/') && !['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(ext)) return 'note';
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'archive';
  
  // Software/Installers
  if (['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 'app'].includes(ext)) return 'software';
  
  // Code files
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp', 'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt', 'scala', 'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'md', 'sql'].includes(ext)) return 'code';
  
  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (type: ResourceType): string => {
  const icons: Record<ResourceType, string> = {
    pdf: 'FileText',
    video: 'Video',
    image: 'Image',
    audio: 'Music',
    note: 'FileEdit',
    archive: 'Archive',
    software: 'Package',
    code: 'Code',
    other: 'File',
  };
  return icons[type];
};

export const getFileIconClass = (type: ResourceType): string => {
  const classes: Record<ResourceType, string> = {
    pdf: 'file-icon-pdf',
    video: 'file-icon-video',
    image: 'file-icon-image',
    audio: 'file-icon-audio',
    note: 'file-icon-note',
    archive: 'file-icon-archive',
    software: 'file-icon-software',
    code: 'file-icon-code',
    other: 'file-icon-default',
  };
  return classes[type];
};
