import {z} from "zod";

export const courseSchema = z.object({
    id: z.coerce.number().int(),
    instructorId: z.number().int().optional(),
    isActive: z.boolean(),
    name: z.string().min(1, {message: "Course name is required"}),
    description: z.string().min(1, {message: "Description is required"})
})
export type Course = z.infer<typeof courseSchema>;