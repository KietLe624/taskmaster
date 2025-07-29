export interface ScheduledTask {
  name: string;
  start_time: string;
  due_date: string;
  project: {
    name: string;
    color: string; // Ví dụ: 'blue', 'green', 'orange'
  };
}

