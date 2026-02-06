import {useNavigate, useParams} from "react-router";
import {useAuth} from "../../hooks/useAuth.ts";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState} from "react";
import {
    createInstructor,
    getInstructor,
    updateInstructor,
} from "../../services/api.instructors.ts";
import {toast} from "sonner";
import {Label} from "../ui/label.tsx";
import {Input} from "../ui/input.tsx";
import {Button} from "../ui/button.tsx";
import {GenderSchema, RoleSchema} from "../../schemas/enums.ts";

const GENDER_VALUES = GenderSchema.options;
const ROLE_VALUES = RoleSchema.options;

const instructorFormSchema = z.object({
    firstname: z.string().min(1, {message: "First name is required"}),
    lastname: z.string().min(1, {message: "Last name is required"}),
    identityNumber: z.string().min(1, {message: "Identity number is required"}),
    gender: GenderSchema,
    isActive: z.boolean(),
    city: z.string().optional(),
    street: z.string().optional(),
    streetNumber: z.string().optional(),
    postalCode: z.string().optional(),
    email: z.string().min(1, {message: "Email is required"}).email({message: "Invalid email"}),
    phoneNumber: z.string().min(1, {message: "Phone number is required"}),
    username: z.string().min(1, {message: "Username is required"}),
    password: z.string().optional(),
    role: RoleSchema,
    vat: z.string()
        .min(9, {message: "VAT is required"})
        .regex(/\d{9}/, {message: "VAT must be a 9-digit number"}),
}).refine(
    (data) => data.password === undefined || data.password === "" || data.password.length >= 8,
    {message: "Password must be at least 8 characters", path: ["password"]}
);

type InstructorFormData = z.infer<typeof instructorFormSchema>;

type LoadedIds = {
    instructorId: number;
    contactDetailsId: number;
    userId: number;
};

const InstructorPage = () => {
    const { instructorUuid } = useParams();
    const isEdit = Boolean(instructorUuid) && instructorUuid !== "new";
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const [loadedIds, setLoadedIds] = useState<LoadedIds | null>(null);

    useEffect(() => {
        if (userRole !== "ADMIN") {
            toast.error("Only ADMIN can add or edit instructors");
            navigate("/instructors", { replace: true });
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
    } = useForm<InstructorFormData>({
        resolver: zodResolver(instructorFormSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            identityNumber: "",
            gender: "MALE",
            isActive: true,
            city: "",
            street: "",
            streetNumber: "",
            postalCode: "",
            email: "",
            phoneNumber: "",
            username: "",
            password: "",
            role: "INSTRUCTOR",
            vat: "",
        },
    });

    useEffect(() => {
        if (!isEdit || !instructorUuid) return;
        getInstructor(instructorUuid)
            .then((data: Record<string, unknown>) => {
                const contactDetails = (data.contactDetailsReadOnlyDTO ?? data.contactDetails) as Record<string, unknown> | undefined;
                const user = (data.userReadOnlyDTO ?? data.user) as Record<string, unknown> | undefined;
                const contactDetailsId = Number(contactDetails?.id ?? data.contactDetailsId ?? 0);
                const userId = Number(user?.id ?? 0);

                setLoadedIds({
                    instructorId: Number(data.id),
                    contactDetailsId,
                    userId,
                });
                reset({
                    firstname: String(data.firstname ?? ""),
                    lastname: String(data.lastname ?? ""),
                    identityNumber: String(data.identityNumber ?? ""),
                    gender: (GENDER_VALUES as readonly string[]).includes(String(data.gender ?? "")) ? String(data.gender) as typeof GENDER_VALUES[number] : "MALE",
                    isActive: Boolean(data.isActive ?? true),
                    city: String(contactDetails?.city ?? ""),
                    street: String(contactDetails?.street ?? ""),
                    streetNumber: String(contactDetails?.streetNumber ?? contactDetails?.street_number ?? ""),
                    postalCode: String(contactDetails?.postalCode ?? contactDetails?.postal_code ?? ""),
                    email: String(contactDetails?.email ?? ""),
                    phoneNumber: String(contactDetails?.phoneNumber ?? contactDetails?.phone_number ?? ""),
                    username: String(user?.username ?? ""),
                    password: "",
                    role: (ROLE_VALUES as readonly string[]).includes(String(user?.role ?? "")) ? String(user?.role) as typeof ROLE_VALUES[number] : "INSTRUCTOR",
                    vat: String(user?.vat ?? ""),
                });
            })
            .catch(() => {
                toast.error("Failed to load instructor");
            });
    }, [isEdit, instructorUuid, reset]);

    const onSubmit = async (data: InstructorFormData) => {
        try {
            if (isEdit && instructorUuid) {
                if (!loadedIds) {
                    toast.error("Please wait for data to load before saving");
                    return;
                }
                const updatePayload = {
                    id: loadedIds.instructorId,
                    uuid: instructorUuid,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    identityNumber: data.identityNumber,
                    gender: data.gender,
                    isActive: data.isActive,
                    contactDetailsUpdateDTO: {
                        id: loadedIds.contactDetailsId,
                        city: data.city ?? "",
                        street: data.street ?? "",
                        streetNumber: data.streetNumber ?? "",
                        postalCode: data.postalCode ?? "",
                        email: data.email ?? "",
                        phoneNumber: data.phoneNumber ?? "",
                    },
                    userUpdateDTO: {
                        id: loadedIds.userId,
                        username: data.username,
                        role: data.role,
                        vat: data.vat,
                        isActive: data.isActive,
                        ...(data.password ? {password: data.password} : {}),
                    },
                };
                await updateInstructor(instructorUuid, updatePayload);
                toast.success("Instructor updated successfully");
            } else {
                if (!data.password) {
                    toast.error("Password is required for new instructors");
                    return;
                }
                const createPayload = {
                    firstname: data.firstname,
                    lastname: data.lastname,
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
                    user: {
                        username: data.username,
                        role: data.role,
                        vat: data.vat,
                        isActive: data.isActive,
                        password: data.password,
                    },
                };
                await createInstructor(createPayload as unknown as Parameters<typeof createInstructor>[0]);
                toast.success("Instructor created successfully");
            }
            navigate("/instructors", { replace: true });
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
                <legend className="font-medium">User</legend>
                <div>
                    <Label htmlFor="username" className="py-2">Username</Label>
                    <Input id="username" {...register("username")} />
                    {errors.username && (
                        <div className="py-1 text-red-600 text-sm">{errors.username.message}</div>
                    )}
                </div>
                <div>
                    <Label htmlFor="password" className="py-2">
                        Password {isEdit && "(leave empty to keep current)"}
                    </Label>
                    <Input id="password" type="password" {...register("password")} />
                    {errors.password && (
                        <div className="py-1 text-red-600 text-sm">{errors.password.message}</div>
                    )}
                </div>
                <div>
                    <Label htmlFor="role" className="py-2">Role</Label>
                    <select id="role" {...register("role")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm cursor-pointer">
                        {ROLE_VALUES.map((v) => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    {errors.role && (
                        <div className="py-1 text-red-600 text-sm">{errors.role.message}</div>
                    )}
                </div>
                <div>
                    <Label htmlFor="vat" className="py-2">VAT (9 digits)</Label>
                    <Input id="vat" {...register("vat")} />
                    {errors.vat && (
                        <div className="py-1 text-red-600 text-sm">{errors.vat.message}</div>
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
                </div>
            </fieldset>

            <div className="flex gap-2 mt-4">
                <Button disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/instructors", { replace: true })}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default InstructorPage;
