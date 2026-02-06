import {useNavigate, useParams} from "react-router";
import {Controller, useForm} from "react-hook-form";
import {type Course, courseSchema} from "../../schemas/courses.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState} from "react";
import {useAuth} from "../../hooks/useAuth.ts";
import {createCourse, getCourse, updateCourse} from "../../services/api.courses.ts";
import {getInstructors} from "../../services/api.instructors.ts";
import {toast} from "sonner";
import {Label} from "../ui/label.tsx";
import {Input} from "../ui/input.tsx";
import {Textarea} from "../ui/textarea.tsx";
import {Button} from "../ui/button.tsx";

type CourseFormData = Omit<Course, "id">;

type InstructorOption = { id: number; firstname: string; lastname: string };

const CoursePage = () => {
    const { courseId } = useParams();
    const isEdit = Boolean(courseId) && courseId !== "new";
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const [instructors, setInstructors] = useState<InstructorOption[]>([]);

    useEffect(() => {
        if (userRole !== "ADMIN") {
            toast.error("Only ADMIN can add or edit courses");
            navigate("/courses", { replace: true });
        }
    }, [userRole, navigate]);

    if (userRole !== "ADMIN") {
        return null;
    }

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema.omit({id: true})),
        defaultValues: {
            instructorId: undefined,
            name: "",
            description: "",
            isActive: true,
        }
    });

    useEffect(() => {
        if (!isEdit || !courseId) return;
        getCourse(Number(courseId))
            .then((data: Record<string, unknown>) => {
                const instructorId = data.instructorId != null ? Number(data.instructorId) : undefined;
                reset({
                    instructorId,
                    name: String(data.name ?? ''),
                    description: String(data.description ?? ''),
                    isActive: Boolean(data.isActive ?? true),
                });
            })
            .catch(() => {
                toast.error("Failed to load course");
            })
    }, [isEdit, courseId, reset]);

    useEffect(() => {
        getInstructors()
            .then((data) => setInstructors(data.map((i) => ({ id: i.id, firstname: i.firstname ?? "", lastname: i.lastname ?? "" }))))
            .catch(() => toast.error("Failed to load instructors"));
    }, []);

    const onSubmit = async (data: CourseFormData) => {
        try {
            if (isEdit && courseId) {
                const id = Number(courseId);
                await updateCourse(id, { ...data, id });
                toast.success("Course updated successfully");
            } else {
                await createCourse(data);
                toast.success("Course created successfully");
            }
            navigate("/courses", { replace: true });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong"
            );
        }
    }

    return(
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-sm mx-auto mt-12 p-8 border rounded-md space-y-4"
                autoComplete="off"
            >
                <div>
                    <Label htmlFor="name" className="py-2">Name</Label>
                    <Input id="name" {...register("name")}/>
                    {errors.name  && (
                        <div className="py-1 text-red-600 text-sm">
                            {errors.name.message}
                        </div>
                    )}
                </div>
                <div>
                    <Label htmlFor="description" className="py-2">Description</Label>
                    <Textarea id="description" {...register("description")}/>
                    {errors.description  && (
                        <div className="py-1 text-red-600 text-sm">
                            {errors.description.message}
                        </div>
                    )}
                </div>
                <div>
                    <Label htmlFor="instructorId" className="py-2">Instructor</Label>
                    <Controller
                        name="instructorId"
                        control={control}
                        render={({ field }) => (
                            <select
                                id="instructorId"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm cursor-pointer"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                onBlur={field.onBlur}
                            >
                                <option value="">-</option>
                                {instructors.map((i) => (
                                    <option key={i.id} value={i.id}>{i.id} - {i.lastname} {i.firstname}</option>
                                ))}
                            </select>
                        )}
                    />
                    {errors.instructorId && (
                        <div className="py-1 text-red-600 text-sm">{errors.instructorId.message}</div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <span>Is Active</span>
                            </label>
                        )}
                    />
                    {errors.isActive && (
                        <div className="py-1 text-red-600 text-sm">
                            {errors.isActive.message}
                        </div>
                    )}
                </div>
                <div className="flex gap-2 mt-4">
                    <Button disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/courses", { replace: true })}>
                        Cancel
                    </Button>
                </div>
            </form>
         </>
    )
}

export default CoursePage;