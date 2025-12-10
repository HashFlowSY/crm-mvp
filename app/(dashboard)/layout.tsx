import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col hidden md:flex">
        <h1 className="text-xl font-bold mb-8">One-Person Co.</h1>
        <nav className="flex-1 space-y-3">
          <Link href="/" className="block px-3 py-2 hover:bg-slate-800 rounded">
            仪表盘
          </Link>
          <Link
            href="/contacts/new"
            className="block px-3 py-2 hover:bg-slate-800 rounded"
          >
            新建联系人
          </Link>
          <Link
            href="/tasks/new"
            className="block px-3 py-2 hover:bg-slate-800 rounded"
          >
            新建任务
          </Link>
        </nav>
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
            className="w-full justify-start text-red-300 hover:text-red-100 hover:bg-slate-800"
          >
            退出登录
          </Button>
        </form>
      </aside>
      <main className="flex-1 p-8 bg-gray-50 overflow-auto">{children}</main>
    </div>
  );
}
