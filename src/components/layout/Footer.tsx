const Footer = () => {
    const currentYear: number = new Date().getFullYear();
    return (
        <>
            <footer className="bg-cf-dark-gray text-white">
                <div className="container mx-auto py-6 text-center min-h-[4vh]">
                    @{currentYear} Cooking Factory. All Rights Reserved.
                </div>
            </footer>
        </>
    )
}
export default Footer;