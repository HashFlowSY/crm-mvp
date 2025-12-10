export type Priority = "urgent" | "high" | "medium" | "low";
export type Status = "pending" | "completed";

export interface Plan {
  id: number;
  user_id: string;
  name: string;
  price: number;
  description: string | null;
  duration_days: number;
}

export interface Contact {
  id: number;
  user_id: string;
  created_at: string;
  name: string;
  email: string;
  notes: string | null;
  current_plan_id: number | null;
  plan_start_date: string | null;
  total_sales_snapshot: number;
  last_renewal_email_sent_at: string | null;
}

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
  status: Status;
  reminder_sent: boolean;
}

// 供多选组件使用的通用接口
export interface Option {
  label: string;
  value: string;
}
