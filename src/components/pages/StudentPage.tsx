import {useNavigate, useParams} from "react-router";
import {useAuth} from "../../hooks/useAuth.ts";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState} from "react";
import {
    createStudent,
    getStudent,
    updateStudent,
} from "../../services/api.students.ts";
import {getCourses} from "../../services/api.courses.ts";
import {toast} from "sonner";
import {Label} from "../ui/label.tsx";
import {Input} from "../ui/input.tsx";
import {Button} from "../ui/button.tsx";
import {GenderSchema} from "../../schemas/enums.ts";

const GENDER_VALUES = GenderSchema.options;

const studentFormSchema = z.object({
    firstname: z.string().min(1, {message: "First name is required"}),
    lastname: z.string().min(1, {message: "Last name is required"}),
    dateOfBirth: z.string().min(1, {message: "Date of birth is required"}),
    vat: z.string()
        .min(9, {message: "VAT is required"})
        .regex(/\d{9}/, {message: "VAT must be a 9-digit number"}),
    identityNumber: z.string().min(1, {message: "Identity number is required"}),
    gender: GenderSchema,
    isActive: z.boolean(),
    city: z.string().optional(),
    street: z.string().optional(),
    streetNumber: z.string().optional(),
    postalCode: z.string().optional(),
    email: z.string().min(1, {message: "Email is required"}).email({message: "Invalid email"}),
    phoneNumber: z.string().min(1, {message: "Phone number is required"}),
    courseIds: z.array(z.number()).optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

type LoadedIds = {
    studentId: number;
    contactDetailsId: number;
};

type CourseOption = { id: number; name: string };

const StudentPage = () => {
    const { studentUuid } = useParams();
    const isEdit = Boolean(studentUuid) && studentUuid !== "new";
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const [loadedIds, setLoadedIds] = useState<LoadedIds | null>(null);
    const [courses, setCourses] = useState<CourseOption[]>([]);

    useEffect(() => {
        if (userRole !== "ADMIN") {
            toast.error("Only ADMIN can add or edit students");
            navigate("/students", { replace: true });
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
    } = useForm<StudentFormData>({
        resolver: zodResolver(studentFormSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            dateOfBirth: "",
            vat: "",
            identityNumber: "",
            gender: "MALE",
            isActive: true,
            city: "",
            street: "",
            streetNumber: "",
            postalCode: "",
            email: "",
            phoneNumber: "",
            courseIds: [],
        },
    });

    useEffect(() => {
        getCourses()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setCourses(list.map((c: { id: number; name: string }) => ({ id: c.id, name: c.name })));
            })
            .catch(() => toast.error("Failed to load courses"));
    }, []);

    useEffect(() => {
        if (!isEdit || !studentUuid) return;
        getStudent(studentUuid)
            .then((data: Record<string, unknown>) => {
                const contactDetails = (data.contactDetailsReadOnlyDTO ?? data.contactDetails) as Record<string, unknown> | undefined;
                const contactDetailsId = Number(contactDetails?.id ?? data.contactDetailsId ?? 0);

                setLoadedIds({
                    studentId: Number(data.id),
                    contactDetailsId,
                });
                const raw = data.enrolledCourseIds ?? data.courseIds ?? data.courses;
                const courseIds = Array.isArray(raw)
                    ? raw
                        .map((c: unknown) => (typeof c === "object" && c != null && "id" in c ? (c as { id: number }).id : Number(c)))
                        .filter((n: number) => !Number.isNaN(n))
                    : [];
                const dateVal = data.dateOfBirth;
                const dateOfBirthStr = dateVal instanceof Date
                    ? dateVal.toISOString().slice(0, 10)
                    : typeof dateVal === "string" ? dateVal.slice(0, 10) : "";

                reset({
                    firstname: String(data.firstname ?? ""),
                    lastname: String(data.lastname ?? ""),
                    dateOfBirth: dateOfBirthStr,
                    vat: String(data.vat ?? ""),
                    identityNumber: String(data.identityNumber ?? ""),
                    gender: (GENDER_VALUES as readonly string[]).includes(String(data.gender ?? "")) ? String(data.gender) as typeof GENDER_VALUES[number] : "MALE",
                    isActive: Boolean(data.isActive ?? true),
                    city: String(contactDetails?.city ?? ""),
                    street: String(contactDetails?.street ?? ""),
                    streetNumber: String(contactDetails?.streetNumber ?? contactDetails?.street_number ?? ""),
                    postalCode: String(contactDetails?.postalCode ?? contactDetails?.postal_code ?? ""),
                    email: String(contactDetails?.email ?? ""),
                    phoneNumber: String(contactDetails?.phoneNumber ?? contactDetails?.phone_number ?? ""),
                    courseIds: Array.isArray(courseIds) ? courseIds : [],
                });
            })
            .catch(() => {
                toast.error("Failed to load student");
            });
    }, [isEdit, studentUuid, reset]);

    const onSubmit = async (data: StudentFormData) => {
        try {
            if (isEdit && studentUuid) {
                if (!loadedIds) {
                    toast.error("Please wait for data to load before saving");
                    return;
                }
                const updatePayload = {
                    id: loadedIds.studentId,
                    uuid: studentUuid,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    dateOfBirth: data.dateOfBirth,
                    vat: data.vat,
                    identityNumber: data.identityNumber,
                    gender: data.gender,
                    isActive: data.isActive,
                    ...(data.courseIds?.length ? { courseIds: data.courseIds } : {}),
                    contactDetailsUpdateDTO: {
                        id: loadedIds.contactDetailsId,
                        city: data.city ?? "",
                        street: data.street ?? "",
                        streetNumber: data.streetNumber ?? "",
                        postalCode: data.postalCode ?? "",
                        email: data.email ?? "",
                        phoneNumber: data.phoneNumber ?? "",
                    },
                };
                await updateStudent(studentUuid, updatePayload as Parameters<typeof updateStudent>[1]);
                toast.success("Student updated successfully");
            } else {
                const createPayload = {
                    ...(data.courseIds?.length ? { courseIds: data.courseIds } : {}),
                    firstname: data.firstname,
                    lastname: data.lastname,
                    dateOfBirth: data.dateOfBirth,
                    vat: data.vat,
                    identityNumber: data.identityNumber,
                    gender: data.gender,
                    isActive: data.isActive,
                    contactDetails: {
                        city: data.city ?? "",
                        street: data.street ?? "",
                        streetNumber: data.streetNumber ?? "",
                        postalCode: data.postalCode ?? "",
                        email: data.email ?? "",
                        phoneNumber: data.phoneNumber ?? "",
                    },
                };
                await createStudent(createPayload as Parameters<typeof createStudent>[0]);
                toast.success("Student created successfully");
            }
            navigate("/students", { replace: true });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong"
            );
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-sm mx-auto my-12 p-8 border rounded-md space-y-4"
            autoComplete="off"
        >
            <div>
                <Label htmlFor="firstname" className="py-2">First name</Label>
                <Input id="firstname" {...register("firstname")} />
                {errors.firstname && (
                    <div className="py-1 text-red-600 text-sm">{errors.firstname.message}</div>
                )}
            </div>
            <div>
                <Label htmlFor="lastname" className="py-2">Last name</Label>
                <Input id="lastname" {...register("lastname")} />
                {errors.lastname && (
                    <div className="py-1 text-red-600 text-sm">{errors.lastname.message}</div>
                )}
            </div>
            <div>
                <Label htmlFor="dateOfBirth" className="py-2">Date of birth</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                {errors.dateOfBirth && (
                    <div className="py-1 text-red-600 text-sm">{errors.dateOfBirth.message}</div>
                )}
            </div>
            <div>
                <Label htmlFor="vat" className="py-2">VAT (9 digits)</Label>
                <Input id="vat" {...register("vat")} />
                {errors.vat && (
                    <div className="py-1 text-red-600 text-sm">{errors.vat.message}</div>
                )}
            </div>
            <div>
                <Label htmlFor="identityNumber" className="py-2">Identity number</Label>
                <Input id="identityNumber" {...register("identityNumber")} />
                {errors.identityNumber && (
                    <div className="py-1 text-red-600 text-sm">{errors.identityNumber.message}</div>
                )}
            </div>
            <div>
                <Label htmlFor="gender" className="py-2">Gender</Label>
                <select id="gender" {...register("gender")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm cursor-pointer">
                    {GENDER_VALUES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
                {errors.gender && (
                    <div className="py-1 text-red-600 text-sm">{errors.gender.message}</div>
                )}
            </div>

            <fieldset className="border p-4 rounded space-y-4">
                <legend className="font-medium">Contact details</legend>
                <div>
                    <Label htmlFor="city" className="py-2">City</Label>
                    <Input id="city" {...register("city")} />
                </div>
                <div>
                    <Label htmlFor="street" className="py-2">Street</Label>
                    <Input id="street" {...register("street")} />
                </div>
                <div>
                    <Label htmlFor="streetNumber" className="py-2">Street number</Label>
                    <Input id="streetNumber" {...register("streetNumber")} />
                </div>
                <div>
                    <Label htmlFor="postalCode" className="py-2">Postal code</Label>
                    <Input id="postalCode" {...register("postalCode")} />
                </div>
                <div>
                    <Label htmlFor="email" className="py-2">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                        <div className="py-1 text-red-600 text-sm">{errors.email.message}</div>
                    )}
                </div>
                <div>
                    <Label htmlFor="phoneNumber" className="py-2">Phone number</Label>
                    <Input id="phoneNumber" {...register("phoneNumber")} />
                    {errors.phoneNumber && (
                        <div className="py-1 text-red-600 text-sm">{errors.phoneNumber.message}</div>
                    )}
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded space-y-4">
                <legend className="font-medium">Enrolled courses</legend>
                <div>
                    <Label className="py-2">Course(s) (select to enroll)</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                        {courses.map((c) => (
                            <label key={c.id} className="flex cursor-pointer items-center gap-2">
                                <Controller
                                    name="courseIds"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="checkbox"
                                            checked={field.value?.includes(c.id) ?? false}
                                            onChange={(e) => {
                                                const prev = field.value ?? [];
                                                field.onChange(
                                                    e.target.checked
                                                        ? [...prev, c.id]
                                                        : prev.filter((id) => id !== c.id)
                                                );
                                            }}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                    )}
                                />
                                <span>{c.name} (id: {c.id})</span>
                            </label>
                        ))}
                        {courses.length === 0 && (
                            <div className="text-sm text-muted-foreground">No courses available</div>
                        )}
                    </div>
                </div>
            </fieldset>

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
            </div>

            <div className="flex gap-2 mt-4">
                <Button disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/students", { replace: true })}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default StudentPage;
