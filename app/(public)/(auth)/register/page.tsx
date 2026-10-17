"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/AuthShell";
import { TextField } from "@/components/auth/TextField";
import { Button } from "@/components/common/Button";
import { registerSchema, type RegisterValues } from "@/utils/validators";
import { useAuth } from "@/context/AuthContext";
import { getApiError } from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setServerError(null);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = values;
      void _confirmPassword;
      await registerUser(payload);
      router.push("/login?registered=1");
    } catch (error) {
      setServerError(getApiError(error, "Đăng ký thất bại."));
    }
  }

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Chỉ mất một phút để bắt đầu đặt phòng."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-lagoon-700 hover:underline"
          >
            Đăng nhập
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
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Họ"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <TextField
            label="Tên"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
        </div>
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <TextField
          label="Nhập lại mật khẩu"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={isSubmitting}
        >
          Tạo tài khoản
        </Button>
      </form>
    </AuthShell>
  );
}
