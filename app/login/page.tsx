"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Masuk</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in dengan akun Google untuk melanjutkan.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-white hover:opacity-90 dark:bg-white dark:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12 c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.12,6.053,28.791,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,16.308,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.12,6.053,28.791,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c4.721,0,9.043-1.807,12.322-4.764l-5.692-4.807C28.466,35.631,26.327,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.538,5.036C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.074,5.556 c0.001-0.001,0.002-0.001,0.003-0.002l5.692,4.807C36.631,38.199,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          Sign in dengan Google
        </button>
      </div>
    </div>
  );
}
