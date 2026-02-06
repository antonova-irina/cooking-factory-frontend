import {z} from "zod";

export const contactDetailsSchema = z.object({
    id: z.coerce.number().int(),
    city: z.string().min(1, {message: "City is required"}),
    street: z.string().optional(),
    streetNumber: z.string().optional(),
    postalCode: z.string().optional(),
    email: z.email().min(1, {message: "Email is required"}),
    phoneNumber: z.string().min(1, {message: "Phone number is required"})
  })
export type contactDetails = z.infer<typeof contactDetailsSchema>;