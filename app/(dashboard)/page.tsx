import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Task } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 并行请求：联系人总数、待办任务数、销售额、今日任务
  const [contactsRes, tasksRes, salesRes, todayTasksRes] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("contacts").select("total_sales_snapshot"),
    supabase
      .from("tasks")
      .select("*")
      .eq("due_date", new Date().toISOString().split("T")[0])
      .order("priority", { ascending: true }),
  ]);

  // 安全的数据解构与类型断言
  const contactsCount = contactsRes.count || 0;
  const tasksCount = tasksRes.count || 0;

  const salesData = (salesRes.data || []) as { total_sales_snapshot: number }[];
  const totalSales = salesData.reduce(
    (acc, curr) => acc + (curr.total_sales_snapshot || 0),
    0
  );

  const todayTasks = (todayTasksRes.data || []) as Task[];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总联系人</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">待办任务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">销售总额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(totalSales / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>今日任务</CardTitle>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <p className="text-muted-foreground">今天无待办任务。</p>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 border-b pb-3 last:border-0"
                >
                  {task.priority === "urgent" && (
                    <AlertCircle className="text-red-500 h-5 w-5" />
                  )}
                  {task.priority === "high" && (
                    <AlertCircle className="text-orange-500 h-5 w-5" />
                  )}
                  <span className="font-medium">{task.title}</span>
                  <span className="ml-auto text-xs text-gray-500 uppercase">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
