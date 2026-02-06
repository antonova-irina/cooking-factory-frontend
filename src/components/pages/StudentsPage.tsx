import {useEffect, useMemo, useState} from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import type {Student} from "../../schemas/students.ts";
import {getStudents} from "../../services/api.students.ts";
import {Button} from "../ui/button.tsx";
import {Loader} from "../ui/loader.tsx";
import {useNavigate} from "react-router";
import {toast} from "sonner";
import {useAuth} from "../../hooks/useAuth.ts";

const StudentsPage = () => {

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { userRole } = useAuth();
    const canEdit = userRole === "ADMIN";

    useEffect(() => {
        setLoading(true);
        getStudents()
            .then((data) => setStudents(Array.isArray(data) ? data : []))
            .catch(() => toast.error("Failed to fetch students"))
            .finally(() => setLoading(false));
    }, [])

    const columns = useMemo<MRT_ColumnDef<Student>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                size: 100,
            },
            {
                header: 'Edit',
                size: 120,
                Cell: ({row}) => (
                    <Button
                        disabled={!canEdit}
                        title={!canEdit ? "Only ADMIN can edit" : undefined}
                        onClick={() => navigate(`/students/${row.original.uuid}`)}
                    >
                        Edit
                    </Button>
                ),
            },
            {
                accessorKey: 'uuid',
                header: 'Uuid',
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
                accessorKey: 'firstname',
                header: 'First name',
            },
            {
                accessorKey: 'lastname',
                header: 'Last name',
            },
            {
                id: 'enrolledCourseIds',
                accessorFn: (row: Record<string, unknown>) => {
                    const arr = row.enrolledCourseIds ?? row.courseIds ?? row.courses;
                    if (!Array.isArray(arr)) return '-';
                    const ids = arr
                        .map((c: unknown) =>
                            typeof c === 'object' && c != null && 'id' in c
                                ? (c as { id: unknown }).id
                                : c
                        )
                        .filter((x: unknown) => x != null && x !== '');
                    return ids.length ? ids.join(', ') : '-';
                },
                header: 'Enrolled course Ids',
            },
            {
                accessorKey: 'dateOfBirth',
                header: 'Date of birth',
            },
            {
                accessorKey: 'vat',
                header: 'Vat',
            },
            {
                accessorKey: 'identityNumber',
                header: 'Identity number',
            },
            {
                accessorKey: 'gender',
                header: 'Gender',
            },
            {
                id: 'city',
                accessorFn: (row: any) => {
                    const contactDetails = row.contactDetailsReadOnlyDTO;
                    return contactDetails?.city || '-';
                },
                header: 'City',
            },
            {
                id: 'street',
                accessorFn: (row: any) => {
                    const contactDetails = row.contactDetailsReadOnlyDTO;
                    return contactDetails?.street || '-';
                },
                header: 'Street',
            },
            {
                id: 'streetNumber',
                accessorFn: (row: any) => {
                    const contactDetails = row.contactDetailsReadOnlyDTO;
                    return contactDetails?.streetNumber || '-';
                },
                header: 'Street number',
            },
            {
                id: 'postalCode',
                accessorFn: (row: any) => {
                    const contactDetails = row.contactDetailsReadOnlyDTO;
                    return contactDetails?.postalCode || '-';
                },
                header: 'Postal code',
            },
            {
                id: 'email',
                accessorFn: (row: any) => {
                    const contactDetails = row.contactDetailsReadOnlyDTO;
                    return contactDetails?.email || '-';
                },
                header: 'Email',
            },
            {
                id: 'phoneNumber',
                accessorFn: (row: any) => {
                    const contactDetails = row.contactDetailsReadOnlyDTO;
                    return contactDetails?.phoneNumber || '-';
                },
                header: 'Phone number',
            }
        ],
        [navigate, canEdit],
    );

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5
    });

    const table = useMaterialReactTable({
        columns,
        data: students,
        onPaginationChange: setPagination,
        state: { pagination },
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    });

    if (loading) {
        return (
            <div className="container mx-auto px-[5vw]">
                <h1 className="text-2xl text-center mt-12">Students</h1>
                <Loader />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-[5vw]">
            <h1 className="text-2xl text-center mt-12">Students</h1>
            <div className="flex justify-start my-6">
                <Button
                className="mt-1"
                disabled={!canEdit}
                title={!canEdit ? "Only ADMIN can add students" : undefined}
                onClick={() => navigate(`/students/new`)}
            >
                Add New
            </Button>
            </div>
            <MaterialReactTable table={table} />
        </div>
    )
}
export default StudentsPage;