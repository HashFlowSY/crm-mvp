import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Server Action
async function createContact(formData: FormData) {
  "use server";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const planIdStr = formData.get("plan_id") as string;

  let priceSnapshot = 0;
  let planStartDate = null;
  let planId: number | null = null;

  // 核心逻辑：读取 Plan 价格并存入 Snapshot [cite: 94]
  if (planIdStr && planIdStr !== "none") {
    planId = Number(planIdStr);
    const { data } = await supabase
      .from("plans")
      .select("price")
      .eq("id", planId)
      .single();
    const plan = data as { price: number } | null;
    if (plan) {
      priceSnapshot = plan.price;
      planStartDate = new Date().toISOString();
    }
  }

  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    name,
    email,
    current_plan_id: planId,
    total_sales_snapshot: priceSnapshot,
    plan_start_date: planStartDate,
  });

  if (error) {
    throw new Error("Create Contact Failed: " + error.message);
  }

  redirect("/");
}

export default async function NewContactPage() {
  const supabase = createClient();
  const { data } = await supabase.from("plans").select("id, name, price");
  // 简单类型定义以避免 any
  const plans = (data || []) as { id: number; name: string; price: number }[];

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>新建联系人</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createContact} className="space-y-5">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input name="name" required />
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label>订阅方案</Label>
              <select
                name="plan_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3"
              >
                <option value="none">无方案</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (¥{p.price / 100})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                价格将在保存时锁定。
              </p>
            </div>
            <Button type="submit" className="w-full">
              保存
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
