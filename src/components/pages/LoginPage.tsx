import {Label} from "../ui/label.tsx";
import {Input} from "../ui/input.tsx";
import {Button} from "../ui/button.tsx";
import {type LoginFields, loginSchema} from "./../../schemas/login.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {useNavigate} from "react-router";
import {useAuth} from "./../../hooks/useAuth.ts";

const LoginPage=() => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginFields>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFields) => {
        try {
            await loginUser(data);
            toast.success("Login successful");
            navigate("/");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Login failed"
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
                    <Label htmlFor="username" className="py-2">Username</Label>
                    <Input id="username" {...register("username")}/>
                    {errors.username  && (
                        <div className="py-1 text-red-600 text-sm">
                            {errors.username.message}
                        </div>
                    )}
                </div>
                <div>
                    <Label htmlFor="password" className="py-2">Password</Label>
                    <Input type="password" id="password" {...register("password")}/>
                    {errors.password  && (
                        <div className="py-1 text-red-600 text-sm">
                            {errors.password.message}
                        </div>
                    )}
                </div>
                <Button disabled={isSubmitting} className="w-full mt-4">
                    {isSubmitting ? "Logging in..." : "Login"}
                </Button>
            </form>
        </>
    )
}
export default LoginPage;