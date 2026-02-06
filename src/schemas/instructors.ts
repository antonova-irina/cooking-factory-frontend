import {z} from "zod";
import {contactDetailsSchema} from "./contactDetails.ts";
import {userSchema} from "./users.ts";
import {GenderSchema} from "./enums.ts";

export const instructorSchema = z.object({
    id: z.coerce.number().int(),
    uuid: z.coerce.string(),
    isActive: z.boolean(),
    firstname: z.string().min(1, {message: "First name is required"}),
    lastname: z.string().min(1, {message: "Last name is required"}),
    identityNumber: z.string().min(1, {message: "Identity number is required"}),
    gender: GenderSchema,
    contactDetails: contactDetailsSchema.optional(),
    user: userSchema.optional(),
})
export type Instructor = z.infer<typeof instructorSchema>;