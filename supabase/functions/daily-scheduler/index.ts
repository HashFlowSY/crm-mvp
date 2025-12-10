import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  // 1. 发送内部日报 (Tasks)
  const today = new Date().toISOString().split("T")[0];
  const { data: tasks } = await supabase
    .from("tasks")
    .select("title")
    .eq("due_date", today)
    .eq("status", "pending")
    .eq("reminder_sent", false);

  if (tasks && tasks.length > 0) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "system@你的域名.com",
        to: "admin@你的域名.com", // 简化起见，MVP 发给固定管理员
        subject: `[Daily] ${tasks.length} Pending Tasks`,
        html: `<ul>${tasks
          .map((t: any) => `<li>${t.title}</li>`)
          .join("")}</ul>`,
      }),
    });
    // 标记为已提醒 (略)
  }

  // 2. 发送客户催缴 (Renewals)
  const { data: expiringContacts } = await supabase.rpc(
    "get_expiring_contacts"
  );

  if (expiringContacts && expiringContacts.length > 0) {
    for (const contact of expiringContacts) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "system@你的域名.com",
          to: contact.email,
          subject: "Renewal Reminder",
          html: `<p>Hi ${contact.name}, your plan is expiring soon.</p>`,
        }),
      });

      await supabase
        .from("contacts")
        .update({ last_renewal_email_sent_at: new Date().toISOString() })
        .eq("id", contact.id);
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
