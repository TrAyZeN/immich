import { JobName, QueueName } from '../job/job.constants';

import {
  IAssetDeletionJob,
  IAssetFaceJob,
  IBaseJob,
  IBulkEntityJob,
  IDeleteFilesJob,
  IEntityJob,
  ILibraryFileJob,
  ILibraryRefreshJob,
  IOfflineLibraryFileJob,
} from '../job/job.interface';

export interface JobCounts {
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  waiting: number;
  paused: number;
}

export interface QueueStatus {
  isActive: boolean;
  isPaused: boolean;
}

export type JobItem =
  // Transcoding
  | { name: JobName.QUEUE_VIDEO_CONVERSION; data: IBaseJob }
  | { name: JobName.VIDEO_CONVERSION; data: IEntityJob }

  // Thumbnails
  | { name: JobName.QUEUE_GENERATE_THUMBNAILS; data: IBaseJob }
  | { name: JobName.GENERATE_JPEG_THUMBNAIL; data: IEntityJob }
  | { name: JobName.GENERATE_WEBP_THUMBNAIL; data: IEntityJob }
  | { name: JobName.GENERATE_THUMBHASH_THUMBNAIL; data: IEntityJob }

  // User Deletion
  | { name: JobName.USER_DELETE_CHECK; data?: IBaseJob }
  | { name: JobName.USER_DELETION; data: IEntityJob }

  // Storage Template
  | { name: JobName.STORAGE_TEMPLATE_MIGRATION; data?: IBaseJob }
  | { name: JobName.STORAGE_TEMPLATE_MIGRATION_SINGLE; data: IEntityJob }
  | { name: JobName.SYSTEM_CONFIG_CHANGE; data?: IBaseJob }

  // Migration
  | { name: JobName.QUEUE_MIGRATION; data?: IBaseJob }
  | { name: JobName.MIGRATE_ASSET; data?: IEntityJob }
  | { name: JobName.MIGRATE_PERSON; data?: IEntityJob }

  // Metadata Extraction
  | { name: JobName.QUEUE_METADATA_EXTRACTION; data: IBaseJob }
  | { name: JobName.METADATA_EXTRACTION; data: IEntityJob }
  | { name: JobName.LINK_LIVE_PHOTOS; data: IEntityJob }

  // Sidecar Scanning
  | { name: JobName.QUEUE_SIDECAR; data: IBaseJob }
  | { name: JobName.SIDECAR_DISCOVERY; data: IEntityJob }
  | { name: JobName.SIDECAR_SYNC; data: IEntityJob }

  // Object Tagging
  | { name: JobName.QUEUE_OBJECT_TAGGING; data: IBaseJob }
  | { name: JobName.CLASSIFY_IMAGE; data: IEntityJob }

  // Recognize Faces
  | { name: JobName.QUEUE_RECOGNIZE_FACES; data: IBaseJob }
  | { name: JobName.RECOGNIZE_FACES; data: IEntityJob }
  | { name: JobName.GENERATE_PERSON_THUMBNAIL; data: IEntityJob }
  | { name: JobName.PERSON_DELETE; data: IEntityJob }

  // Clip Embedding
  | { name: JobName.QUEUE_ENCODE_CLIP; data: IBaseJob }
  | { name: JobName.ENCODE_CLIP; data: IEntityJob }

  // Filesystem
  | { name: JobName.DELETE_FILES; data: IDeleteFilesJob }

  // Audit log cleanup
  | { name: JobName.CLEAN_OLD_AUDIT_LOGS; data?: IBaseJob }

  // Asset Deletion
  | { name: JobName.PERSON_CLEANUP; data?: IBaseJob }
  | { name: JobName.ASSET_DELETION; data: IAssetDeletionJob }
  | { name: JobName.ASSET_DELETION_CHECK; data?: IBaseJob }

  // Library Managment
  | { name: JobName.LIBRARY_SCAN_ASSET; data: ILibraryFileJob }
  | { name: JobName.LIBRARY_MARK_ASSET_OFFLINE; data: IOfflineLibraryFileJob }
  | { name: JobName.LIBRARY_SCAN; data: ILibraryRefreshJob }
  | { name: JobName.LIBRARY_REMOVE_OFFLINE; data: IEntityJob }
  | { name: JobName.LIBRARY_DELETE; data: IEntityJob }
  | { name: JobName.LIBRARY_QUEUE_SCAN_ALL; data: IBaseJob }
  | { name: JobName.LIBRARY_QUEUE_CLEANUP; data: IBaseJob }

  // Search
  | { name: JobName.SEARCH_INDEX_ASSETS; data?: IBaseJob }
  | { name: JobName.SEARCH_INDEX_ASSET; data: IBulkEntityJob }
  | { name: JobName.SEARCH_INDEX_FACES; data?: IBaseJob }
  | { name: JobName.SEARCH_INDEX_FACE; data: IAssetFaceJob }
  | { name: JobName.SEARCH_INDEX_ALBUMS; data?: IBaseJob }
  | { name: JobName.SEARCH_INDEX_ALBUM; data: IBulkEntityJob }
  | { name: JobName.SEARCH_REMOVE_ASSET; data: IBulkEntityJob }
  | { name: JobName.SEARCH_REMOVE_ALBUM; data: IBulkEntityJob }
  | { name: JobName.SEARCH_REMOVE_FACE; data: IAssetFaceJob };

export type JobHandler<T = any> = (data: T) => boolean | Promise<boolean>;
export type JobItemHandler = (item: JobItem) => Promise<void>;

export const IJobRepository = 'IJobRepository';

export interface IJobRepository {
  addHandler(queueName: QueueName, concurrency: number, handler: JobItemHandler): void;
  setConcurrency(queueName: QueueName, concurrency: number): void;
  queue(item: JobItem): Promise<void>;
  pause(name: QueueName): Promise<void>;
  resume(name: QueueName): Promise<void>;
  empty(name: QueueName): Promise<void>;
  getQueueStatus(name: QueueName): Promise<QueueStatus>;
  getJobCounts(name: QueueName): Promise<JobCounts>;
}
