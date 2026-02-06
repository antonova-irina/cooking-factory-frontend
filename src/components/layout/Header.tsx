import {Link} from "react-router";
import {AuthButton} from "../AuthButton.tsx";

const Header = () => {
    return (
        <>
            <header className="bg-cf-old-gold w-full fixed z-999">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <Link to="/" className="ps-[1vw] cursor-pointer transition-opacity hover:opacity-90">
                        <img className="my-1 h-24"
                             src="/cooking-factory-logo.png"
                             alt="Cooking Factory Logo"
                        />
                    </Link>
                    <nav className="flex gap-4 text-white font-medium">
                        <AuthButton/>
                    </nav>
                </div>
            </header>
        </>
    )
}
export default Header;