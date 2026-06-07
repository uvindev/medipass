/**
 * MediPass — Auth Middleware
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Refreshes the Supabase session cookie and gates routes by role. Runs on the
 * edge — no Prisma here, only supabase.auth.getUser().
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PATIENT_PREFIX = "/patient";
const DOCTOR_PREFIX = "/doctor";
const AUTH_PATHS = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.user_metadata?.["role"] as
    | "patient"
    | "doctor"
    | undefined;
  const { pathname } = request.nextUrl;

  const redirect = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    return NextResponse.redirect(url);
  };

  const wantsPatient = pathname.startsWith(PATIENT_PREFIX);
  const wantsDoctor = pathname.startsWith(DOCTOR_PREFIX);
  const onAuthPage = AUTH_PATHS.includes(pathname);

  // Unauthenticated visitors can't reach protected areas.
  if ((wantsPatient || wantsDoctor) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Wrong-role access is bounced to the user's own home.
  if (wantsPatient && role === "doctor") return redirect(DOCTOR_PREFIX);
  if (wantsDoctor && role === "patient") return redirect("/patient/dashboard");

  // Signed-in users skip the auth pages.
  if (onAuthPage && role) {
    return redirect(role === "doctor" ? DOCTOR_PREFIX : "/patient/dashboard");
  }

  return response;
}
