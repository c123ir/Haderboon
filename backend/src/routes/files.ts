// backend/src/routes/files.ts

import { Router } from 'express';
import {
  uploadFiles,
  uploadProjectZip,
  uploadLocalDirectory,
  getProjectFiles,
  getFileContent,
  deleteFile,
  reAnalyzeProject,
  startProjectWatching,
  stopProjectWatching,
  getWatchingStatus
} from '../controllers/filesController';
import { authenticateToken } from '../middleware/auth';
import { uploadMultiple, uploadProjectZip as uploadZip, handleUploadError } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Upload multiple files to project
router.post('/projects/:projectId/upload', uploadMultiple, handleUploadError, uploadFiles);

// Upload project as ZIP
router.post('/projects/:projectId/upload-zip', uploadZip, handleUploadError, uploadProjectZip);

// Upload local directory
router.post('/projects/:projectId/upload-directory', uploadLocalDirectory);

// Get project files (tree structure)
router.get('/projects/:projectId/files', getProjectFiles);

// Get single file content
router.get('/projects/:projectId/files/:fileId', getFileContent);

// Delete file
router.delete('/projects/:projectId/files/:fileId', deleteFile);

// Re-analyze project
router.post('/projects/:projectId/reanalyze', reAnalyzeProject);

// Start project watching
router.post('/projects/:projectId/start-watching', startProjectWatching);

// Stop project watching
router.post('/projects/:projectId/stop-watching', stopProjectWatching);

// Get project watching status
router.get('/projects/:projectId/watching-status', getWatchingStatus);

export default router;