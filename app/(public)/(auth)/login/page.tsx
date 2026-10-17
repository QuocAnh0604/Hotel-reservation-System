"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/AuthShell";
import { TextField } from "@/components/auth/TextField";
import { Button } from "@/components/common/Button";
import { loginSchema, type LoginValues } from "@/utils/validators";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      const user = await login(values);
      router.push(user.role === "ADMIN" ? "/admin/dashboard" : "/hotels");
    } catch (error) {
      setServerError(getApiError(error, "Đăng nhập thất bại."));
    }
  }

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Đăng nhập để đặt phòng và xem lại các lượt đặt của bạn."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-lagoon-700 hover:underline"
          >
            Đăng ký
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-coral/30 bg-coral-50 px-4 py-3 text-sm text-coral"
          >
            {serverError}
          </div>
        )}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="ban@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Đăng nhập
        </Button>
      </form>
    </AuthShell>
  );
}
