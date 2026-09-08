/**
 * Client-side helper for communicating with the archive worker.
 */

import type { WorkerRequest, WorkerResponse } from './archive-worker.js';

/**
 * Worker client for offloading archive operations to a Web Worker.
 */
export class ArchiveWorkerClient {
  private worker: Worker | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    string,
    {
      resolve: (result: unknown) => void;
      reject: (error: Error) => void;
      onProgress?: (processed: number, total: number) => void;
    }
  >();

  /**
   * Initialize the worker.
   * @param workerUrl URL to the worker script
   */
  constructor(workerUrl: string | URL) {
    this.worker = new Worker(workerUrl, { type: 'module' });
    this.worker.addEventListener('message', this.handleMessage.bind(this));
    this.worker.addEventListener('error', this.handleError.bind(this));
  }

  /**
   * Handle messages from the worker.
   */
  private handleMessage(event: MessageEvent<WorkerResponse>) {
    const message = event.data;
    const request = this.pendingRequests.get(message.id);

    if (!request) {
      console.warn('Received message for unknown request:', message.id);
      return;
    }

    switch (message.type) {
      case 'success':
        request.resolve(message.result);
        this.pendingRequests.delete(message.id);
        break;

      case 'progress':
        if (request.onProgress) {
          request.onProgress(message.processed, message.total);
        }
        break;

      case 'error':
        request.reject(new Error(message.error));
        this.pendingRequests.delete(message.id);
        break;

      case 'inspect-result':
        request.resolve(message.entries);
        this.pendingRequests.delete(message.id);
        break;
    }
  }

  /**
   * Handle worker errors.
   */
  private handleError(event: ErrorEvent) {
    console.error('Worker error:', event);
    // Reject all pending requests
    for (const [id, request] of this.pendingRequests) {
      request.reject(new Error(`Worker error: ${event.message}`));
      this.pendingRequests.delete(id);
    }
  }

  /**
   * Send a request to the worker.
   */
  private sendRequest<T>(
    request: Omit<WorkerRequest, 'id'>,
    transfer?: Transferable[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<T> {
    if (!this.worker) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    const id = `req_${this.requestId++}`;
    const fullRequest: WorkerRequest = { ...request, id } as WorkerRequest;

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (result: unknown) => void,
        reject,
        onProgress,
      });

      if (transfer) {
        this.worker!.postMessage(fullRequest, transfer);
      } else {
        this.worker!.postMessage(fullRequest);
      }
    });
  }

  /**
   * Compress data using GZIP.
   */
  async compress(
    data: Uint8Array,
    level?: number,
    onProgress?: (processed: number, total: number) => void
  ): Promise<Uint8Array> {
    return this.sendRequest<Uint8Array>(
      { type: 'compress', data, level } as Omit<WorkerRequest, 'id'>,
      [data.buffer],
      onProgress
    );
  }

  /**
   * Decompress GZIP data.
   */
  async decompress(
    data: Uint8Array,
    onProgress?: (processed: number, total: number) => void
  ): Promise<Uint8Array> {
    return this.sendRequest<Uint8Array>({ type: 'decompress', data }, [data.buffer], onProgress);
  }

  /**
   * Inspect a ZIP archive.
   */
  async inspectZip(
    data: Uint8Array
  ): Promise<Array<{ path: string; size: number; isDirectory: boolean }>> {
    return this.sendRequest({ type: 'inspect-zip', data }, [data.buffer]);
  }

  /**
   * Terminate the worker.
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Reject all pending requests
    for (const [id, request] of this.pendingRequests) {
      request.reject(new Error('Worker terminated'));
      this.pendingRequests.delete(id);
    }
  }
}
