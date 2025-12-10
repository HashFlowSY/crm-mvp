import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // 确保你安装了 textarea 组件，如果没有就用 Input

// Server Action
async function createPlan(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const priceInput = formData.get("price") as string;
  const duration = formData.get("duration") as string;
  const description = formData.get("description") as string;

  // 业务逻辑：将元转换为分 (¥100.00 -> 10000)
  const priceInCents = Math.round(parseFloat(priceInput) * 100);

  const { error } = await supabase.from("plans").insert({
    user_id: user.id,
    name,
    price: priceInCents,
    duration_days: parseInt(duration),
    description: description || null,
  });

  if (error) {
    throw new Error("Create Plan Failed: " + error.message);
  }

  redirect("/plans");
}

export default function NewPlanPage() {
  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>新建订阅方案</CardTitle>
          <CardDescription>设置产品服务包，用于客户订阅</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPlan} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">方案名称</Label>
              <Input
                id="name"
                name="name"
                placeholder="例如：年度会员 (Pro)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">价格 (元)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="99.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">有效期 (天)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  defaultValue="365"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述 (可选)</Label>
              {/* 如果没有安装 Textarea 组件，可以使用 <Input /> */}
              <Input
                id="description"
                name="description"
                placeholder="方案包含的服务内容..."
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">
                创建方案
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
