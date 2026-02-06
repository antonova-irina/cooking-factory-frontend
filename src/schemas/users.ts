import {z} from "zod";
import {RoleSchema} from "./enums.ts";

export const userSchema = z.object({
    id: z.coerce.number().int(),
    is_active: z.boolean(),
    username: z.string().min(1, {message: "Username is required"}),
    password: z.string()
        .min(1, {error: "Password is required"})
        .regex(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[@#$!%&*]).{8,}$/, {error: "Invalid password"}),
    role: RoleSchema,
    vat: z.string()
        .min(9, {message: "Vat is required"})
        .regex(/\d{9}/, {message: "VAT must be a 9-digit number"})
})
export type User = z.infer<typeof userSchema>;