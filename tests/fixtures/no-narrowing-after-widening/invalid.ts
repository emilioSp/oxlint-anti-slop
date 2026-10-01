type Job = {
  id: string;
  queue: string;
};

declare const job: Job;

const jobPayload: object = {
  jobId: job.id,
  queue: job.queue,
  retries: 0,
};

export const payload = jobPayload as {
  jobId: string;
  queue: string;
  retries: number;
};
