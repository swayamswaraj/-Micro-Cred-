// src/lib/api.ts (FINAL FIX)

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "https://micro-cred-two.vercel.app/api";

async function request(path: string, opts: RequestInit = {}) {
  const finalHeaders: Record<string, string> = {
    ...((opts.headers as Record<string, string>) || {}),
  };

  const isForm = opts.body instanceof FormData;
  if (!isForm && opts.body) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: finalHeaders as HeadersInit,
    credentials: "include",
  });

  if (!res.ok) {
    let errBody = {};
    try {
      errBody = await res.json();
    } catch {}
    throw new Error((errBody as any).message || res.statusText || "HTTP Error");
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function apiRegister(
  email: string,
  password: string,
  fullName: string,
  role: "student" | "employer"
) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName, role }),
  });
}

export async function apiLogin(email: string, password: string) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetProfile() {
  return request("/auth/profile", { method: "GET", credentials: "include" }).catch(() => null);
}

export async function apiPostCredentialMultipart(formData: FormData) {
  const res = await fetch(`${API_BASE}/credentials`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: "Unknown" }));
    throw new Error(errBody.message || errBody.error || res.statusText);
  }
  return res.json();
}

export async function apiUpdateProfile(data: FormData | Record<string, any>) {
  if (data instanceof FormData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      body: data,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown" }));
      throw new Error(err.message || err.error || "Failed");
    }
    return res.json();
  } else {
    return request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export async function apiGetCredentials() {
  return request("/credentials", { method: "GET" });
}

export async function apiDeleteCredential(id: string) {
  return request(`/credentials/${id}`, { method: "DELETE" });
}

// FIX: Point the client API call to the correct server path
export async function apiGetStudentsWithCredentials() {
  return request("/employer/students", { method: "GET" });
}
