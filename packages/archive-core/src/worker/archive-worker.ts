/**
 * Web Worker for CPU-intensive archive operations.
 * Handles compression/decompression in a separate thread to avoid blocking the main thread.
 */

import * as fflate from 'fflate';

/**
 * Message types for worker communication.
 */
export type WorkerRequest =
  | { type: 'compress'; data: Uint8Array; level?: number; id: string }
  | { type: 'decompress'; data: Uint8Array; id: string }
  | { type: 'inspect-zip'; data: Uint8Array; id: string };

export type WorkerResponse =
  | { type: 'success'; result: Uint8Array; id: string }
  | { type: 'progress'; processed: number; total: number; id: string }
  | { type: 'error'; error: string; id: string }
  | {
      type: 'inspect-result';
      entries: Array<{ path: string; size: number; isDirectory: boolean }>;
      id: string;
    };

/**
 * Handle incoming messages from the main thread.
 */
self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  try {
    switch (message.type) {
      case 'compress':
        await handleCompress(message);
        break;

      case 'decompress':
        await handleDecompress(message);
        break;

      case 'inspect-zip':
        await handleInspectZip(message);
        break;

      default: {
        const exhaustive: never = message;
        postError(`Unknown message type: ${(exhaustive as { type: string }).type}`, (exhaustive as { id: string }).id);
      }
    }
  } catch (error) {
    postError(
      error instanceof Error ? error.message : 'Unknown error',
      message.id
    );
  }
});

/**
 * Handle compression request.
 */
async function handleCompress(message: WorkerRequest & { type: 'compress' }) {
  const { data, level = 6, id } = message;

  fflate.gzip(data, { level: level as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }, (err, result) => {
    if (err) {
      postError(`Compression failed: ${err.message}`, id);
      return;
    }

    // Post result back to main thread (transferable)
    self.postMessage(
      {
        type: 'success',
        result,
        id,
      } satisfies WorkerResponse,
      { transfer: [result.buffer] }
    );
  });
}

/**
 * Handle decompression request.
 */
async function handleDecompress(message: WorkerRequest & { type: 'decompress' }) {
  const { data, id } = message;

  fflate.gunzip(data, (err, result) => {
    if (err) {
      postError(`Decompression failed: ${err.message}`, id);
      return;
    }

    // Post result back to main thread (transferable)
    self.postMessage(
      {
        type: 'success',
        result,
        id,
      } satisfies WorkerResponse,
      { transfer: [result.buffer] }
    );
  });
}

/**
 * Handle ZIP inspection request.
 */
async function handleInspectZip(message: WorkerRequest & { type: 'inspect-zip' }) {
  const { data, id } = message;

  fflate.unzip(data, (err, unzipped) => {
    if (err) {
      postError(`Failed to inspect ZIP: ${err.message}`, id);
      return;
    }

    const entries = Object.entries(unzipped).map(([path, fileData]) => ({
      path,
      size: fileData.length,
      isDirectory: path.endsWith('/'),
    }));

    self.postMessage({
      type: 'inspect-result',
      entries,
      id,
    } satisfies WorkerResponse);
  });
}

/**
 * Post error message back to main thread.
 */
function postError(error: string, id: string) {
  self.postMessage({
    type: 'error',
    error,
    id,
  } satisfies WorkerResponse);
}

// Export empty object to make this a module
export {};
