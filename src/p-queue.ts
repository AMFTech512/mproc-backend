import PQueue from "p-queue";

interface QueueOptions {
  concurrency?: number;
}

export function initQueue(options?: QueueOptions): PQueue {
  return new PQueue({ concurrency: options?.concurrency ?? 1 });
}
