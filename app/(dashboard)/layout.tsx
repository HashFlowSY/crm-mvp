import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";

// 1. 静态配置移到外部
const navLinks = [
  { href: "/", label: "仪表盘" },
  { href: "/contacts/new", label: "新建联系人" },
  { href: "/tasks/new", label: "新建任务" },
  { href: "/plans", label: "方案管理" },
];

// 2. 将 SidebarContent 提取为独立的组件 (Fix: Declare components outside of render)
function SidebarContent() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center border-b border-slate-800 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-white"
        >
          <LayoutDashboard className="h-6 w-6" />
          <span>One-Person Co.</span>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-4 text-sm font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-slate-800"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        {/* Server Action 可以直接嵌入 Server Component */}
        <form
          action={async () => {
            "use server";
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/login");
          }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </form>
      </div>
    </div>
  );
}

// 3. 主 Layout 组件
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* 桌面端侧边栏 */}
      <aside className="hidden w-64 flex-col bg-slate-900 md:flex fixed inset-y-0 left-0 z-10">
        <SidebarContent />
      </aside>

      {/* 主内容区域 */}
      <div className="flex flex-col flex-1 md:ml-64 transition-all duration-300 ease-in-out">
        {/* 移动端顶部导航 Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 md:hidden sticky top-0 z-20">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-slate-900 p-0 text-white border-r-slate-800"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation
              </SheetDescription>
              {/* 复用 SidebarContent */}
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="font-bold text-lg">Indie CRM</div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
