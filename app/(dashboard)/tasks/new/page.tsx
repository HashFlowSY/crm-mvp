"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelect } from "@/components/multi-select";
import { toast } from "sonner";
import { Option } from "@/types/database";

export default function NewTaskPage() {
  const [contacts, setContacts] = useState<Option[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("contacts").select("id, name");
      if (data) {
        setContacts(
          data.map((c: { id: number; name: string }) => ({
            label: c.name,
            value: String(c.id),
          }))
        );
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("未登录");
      return;
    }

    // 1. 创建 Task
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: formData.get("title") as string,
        priority: formData.get("priority") as string,
        due_date: formData.get("due_date") as string,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // 2. 创建 Task-Contact 关联
    if (selectedContacts.length > 0 && task) {
      const relations = selectedContacts.map((contactId) => ({
        task_id: task.id,
        contact_id: Number(contactId),
      }));
      const { error: relError } = await supabase
        .from("task_contacts")
        .insert(relations);
      if (relError) console.error(relError);
    }

    toast.success("任务已创建");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>新建任务</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>任务标题</Label>
              <Input name="title" required placeholder="例如：跟进续费" />
            </div>
            <div className="space-y-2">
              <Label>优先级</Label>
              <select
                name="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3"
              >
                <option value="medium">中 (Medium)</option>
                <option value="high">高 (High)</option>
                <option value="urgent">紧急 (Urgent)</option>
                <option value="low">低 (Low)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>截止日期</Label>
              <Input name="due_date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label>关联联系人 (多选)</Label>
              <MultiSelect
                options={contacts}
                selected={selectedContacts}
                onChange={setSelectedContacts}
                placeholder="选择相关联系人..."
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "提交中..." : "创建任务"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
