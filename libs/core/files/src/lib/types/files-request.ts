import { FilesRole } from './files-role';

export type FilesRequest = {
  externalUserId: string;
  filesUser?: { userRole: FilesRole };
  headers: Record<string, string>;
};
