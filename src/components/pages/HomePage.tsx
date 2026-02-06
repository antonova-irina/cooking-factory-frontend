import { Link } from "react-router";
import {useEffect} from "react";

const HomePage = () => {
    const links = [
        // {path: "/", label: "Home Page"},
        {path: "/courses", label: "Courses"},
        {path: "/students", label: "Students"},
        {path: "/instructors", label: "Instructors"}
        // {path: "/login", label: "Login"},
    ];

    useEffect(()=> {
        document.title = "Cooking Factory Home Page";
    }, []);

    return (
        <>
            <h1 className="text-2xl text-center my-12">Home Page</h1>
            <div className="flex flex-col items-start max-w-sm mx-auto gap-4">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className="bg-gray-200 w-full px-4 py-2 rounded cursor-pointer transition-colors hover:bg-gray-300"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </>
    )
}
export default HomePage;