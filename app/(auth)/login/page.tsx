"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, Mail, LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 统一处理加载状态
  const executeAuth = async (action: "login" | "signup") => {
    if (!email || !password) return toast.error("请输入邮箱和密码");

    setLoading(true);

    try {
      if (action === "signup") {
        // 注册前先清理旧状态
        await supabase.auth.signOut();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
        });
        if (error) throw error;
        toast.success("注册验证邮件已发送", {
          description: "请前往邮箱查收并点击链接激活。",
        });
      } else {
        // 登录
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("欢迎回来");
        router.push("/");
        router.refresh();
      }
    } catch (error: unknown) {
      // 核心修复：使用 unknown + 类型检查代替 any
      let errorMessage = "请检查邮箱或密码是否正确";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(action === "login" ? "登录失败" : "注册失败", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 支持回车键提交
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeAuth("login");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-[380px] shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Indie CRM
          </CardTitle>
          <CardDescription>独立开发者的一站式客户管理系统</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">密码</Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full bg-slate-900 hover:bg-slate-800"
            onClick={() => executeAuth("login")}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            登录
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或者
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => executeAuth("signup")}
            disabled={loading}
          >
            注册新账号
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
