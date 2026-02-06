import {useEffect, useMemo, useState} from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import type {Course} from "../../schemas/courses.ts";
import {useNavigate} from "react-router";
import {Button} from "../ui/button.tsx";
import {Loader} from "../ui/loader.tsx";
import {useAuth} from "../../hooks/useAuth.ts";
import {getCourses} from "../../services/api.courses.ts";
import {toast} from "sonner";

const CoursesPage = () => {

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { userRole } = useAuth();
    const canEdit = userRole === "ADMIN";

    useEffect(() => {
        setLoading(true);
        getCourses()
            .then((data) => setCourses(Array.isArray(data) ? data : []))
            .catch(() => toast.error("Failed to fetch courses"))
            .finally(() => setLoading(false));
    }, [])

    //should be memoized or stable
    const columns = useMemo<MRT_ColumnDef<Course>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                size: 100,
            },
            {
                header: 'Edit',
                size: 120,
                Cell: ({ row}) => (
                    <Button
                        disabled={!canEdit}
                        title={!canEdit ? "Only ADMIN can edit" : undefined}
                        onClick={() => navigate(`/courses/${row.original.id}`)}
                    >
                        Edit
                    </Button>
                ),
            },
            {
                id: 'status',
                accessorFn: (row: any) => {
                    const isActive = row.isActive;
                    if (isActive === undefined || isActive === null) {
                        return '-';
                    }
                    return isActive ? 'Active' : 'Inactive';
                },
                header: 'Status',
            },
            {
                accessorKey: 'name',
                header: 'Course name',
                muiTableHeadCellProps: { align: 'left' },
                muiTableBodyCellProps: { align: 'left' },
            },
            {
                accessorKey: 'description',
                header: 'Course description',
                muiTableHeadCellProps: { align: 'left' },
                muiTableBodyCellProps: { align: 'left' },
            },
            {
                accessorKey: 'instructorId',
                header: 'Instructor Id',
            },
        ],
        [navigate, canEdit],
    );

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const table = useMaterialReactTable({
        columns,
        data: courses,
        onPaginationChange: setPagination,
        state: { pagination },
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    });

    if (loading) {
        return (
            <div className="container mx-auto px-[5vw]">
                <h1 className="text-2xl text-center mt-12">Courses</h1>
                <Loader />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-[5vw]">
            <h1 className="text-2xl text-center mt-12">Courses</h1>
            <div className="flex justify-start my-6">
                <Button
                className="mt-1"
                disabled={!canEdit}
                title={!canEdit ? "Only ADMIN can add courses" : undefined}
                onClick={() => navigate('/courses/new')}
            >
                Add New
            </Button>
            </div>
            <MaterialReactTable table={table} />
        </div>
    )
}
export default CoursesPage;