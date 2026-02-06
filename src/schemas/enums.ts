import {z} from "zod";

export const GenderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);
export type Gender = z.infer<typeof GenderSchema>;

export const RoleSchema = z.enum(["ADMIN", "INSTRUCTOR"]);
export type Role = z.infer<typeof RoleSchema>;
