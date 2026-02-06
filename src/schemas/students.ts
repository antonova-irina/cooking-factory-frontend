import {z} from "zod";
import {contactDetailsSchema} from "./contactDetails.ts";
import {GenderSchema} from "./enums.ts";

export const studentSchema = z.object({
    id: z.coerce.number().int(),
    uuid: z.coerce.string(),
    isActive: z.boolean(),
    firstname: z.string().min(1, {message: "First name is required"}),
    lastname: z.string().min(1, {message: "Last name is required"}),
    dateOfBirth: z.string().or(z.coerce.date()),
    vat: z.string()
        .min(9, {message: "VAT is required"})
        .regex(/\d{9}/, {message: "VAT must be a 9-digit number"}),
    identityNumber: z.string().min(1, {message: "Identity number is required"}),
    gender: GenderSchema,
    contactDetails: contactDetailsSchema.optional()
})
export type Student = z.infer<typeof studentSchema>;