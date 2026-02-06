import {BrowserRouter, Routes, Route} from "react-router";
import Layout from "./components/layout/Layout.tsx";
import HomePage from "./components/pages/HomePage.tsx";
import {Toaster} from "sonner";
import LoginPage from "./components/pages/LoginPage.tsx";
import {AuthProvider} from "./context/AuthProvider.tsx";
import StudentsPage from "./components/pages/StudentsPage.tsx";
import CoursesPage from "./components/pages/CoursesPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import CoursePage from "./components/pages/CoursePage.tsx";
import InstructorsPage from "./components/pages/InstructorsPage.tsx";
import InstructorPage from "./components/pages/InstructorPage.tsx";
import StudentPage from "./components/pages/StudentPage.tsx";

function App() {
    return (
        <>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="login" element={<LoginPage />}/>
                            <Route path="/" element={<ProtectedRoute />}>

                                <Route index element={<HomePage />}/>
                                <Route path="courses" element={<CoursesPage/>}/>
                                <Route path="courses/:courseId" element={<CoursePage/>}/>
                                <Route path="courses/new" element={<CoursePage/>}/>
                                <Route path="students" element={<StudentsPage/>}/>
                                <Route path="students/new" element={<StudentPage/>}/>
                                <Route path="students/:studentUuid" element={<StudentPage/>}/>
                                <Route path="instructors" element={<InstructorsPage/>}/>
                                <Route path="instructors/new" element={<InstructorPage/>}/>
                                <Route path="instructors/:instructorUuid" element={<InstructorPage/>}/>
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
                <Toaster richColors />
            </AuthProvider>
        </>
    )
}

export default App;