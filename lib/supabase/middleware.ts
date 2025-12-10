import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. 初始化响应对象
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. 创建 Supabase 客户端 (Middleware 专用)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 关键步骤：同时更新 Request 和 Response 的 Cookies
          // 这样 Server Component 能读到最新的，浏览器也能收到最新的
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. 刷新 Session
  // getUser() 会自动检测 Token 是否过期，如果过期会调用 setAll 刷新
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. 简单的路由守卫 (可选，但推荐)
  // 如果用户未登录且访问的是受保护页面，重定向到登录页
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/api") && // 排除 API
    request.nextUrl.pathname !== "/" // 允许首页或根据需求调整
  ) {
    // 如果是仪表盘内部页面，强制跳回登录
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
