type QueueJob = {
  jobId: string;
  queue: string;
  retries: number;
};

type Job = {
  id: string;
  queue: string;
};

declare const job: Job;

export const payload = {
  jobId: job.id,
  queue: job.queue,
  retries: 0,
} satisfies QueueJob;
