import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import {Outlet} from "react-router";

const Layout = () => {
    return (
        <>
            <>
                <Header />
                <div className="container mx-auto pt-24 min-h-[90vh]">
                    <Outlet/>
                </div>
                <Footer />
            </>
        </>
    )
}

export default Layout;