import { z } from "zod";

const createUserSchema = z.object({
  body: z.object({
    name: z.object({
      firstName: z.string({
        required_error: "First name is required",
        invalid_type_error: "First name must be a string",
      }),
      middleName: z.string().optional(),
      lastName: z.string({
        required_error: "Last name is required",
        invalid_type_error: "Last name must be a string",
      }),
    }),
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
      })
      .email({
        message: "Must be a valid email",
      }),
    password: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
      })
      .min(6, { message: "Password must be at least 6 characters" }),
    phone: z.string({
      required_error: "Phone is required",
      invalid_type_error: "Phone must be a string",
    }),
    role: z.enum(["admin", "user"], {
      required_error: "Role is required",
      invalid_type_error: "Role must be a string",
    }),
    address: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const userValidation = {
  createUserSchema,
};
