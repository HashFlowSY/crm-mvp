import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Plan } from "@/types/database";

export default async function PlansPage() {
  const supabase = await createClient();

  // 获取方案列表
  const { data } = await supabase
    .from("plans")
    .select("*")
    .order("price", { ascending: true });

  // 强类型转换
  const plans = (data || []) as Plan[];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">方案管理</h2>
        <Link href="/plans/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> 新建方案
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
            暂无方案，请点击右上角新建。
          </div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {plan.name}
                </CardTitle>
                <div className="text-xl font-bold">
                  ¥{(plan.price / 100).toFixed(0)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mt-2">
                  周期: {plan.duration_days} 天
                </div>
                {plan.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {plan.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
