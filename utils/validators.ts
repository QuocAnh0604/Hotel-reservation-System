import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email chưa đúng định dạng"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    lastName: z.string().trim().min(1, "Vui lòng nhập họ"),
    firstName: z.string().trim().min(1, "Vui lòng nhập tên"),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Email chưa đúng định dạng"),
    password: z
      .string()
      .min(8, "Mật khẩu cần ít nhất 8 ký tự")
      .regex(/[A-Za-z]/, "Mật khẩu cần có chữ cái")
      .regex(/[0-9]/, "Mật khẩu cần có chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại chưa khớp",
  });
export type RegisterValues = z.infer<typeof registerSchema>;
