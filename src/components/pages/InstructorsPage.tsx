import {useEffect, useMemo, useState} from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import type {Instructor} from "../../schemas/instructors.ts";
import {getInstructors} from "../../services/api.instructors.ts";
import {Button} from "../ui/button.tsx";
import {Loader} from "../ui/loader.tsx";
import {useNavigate} from "react-router";
import {toast} from "sonner";
import {useAuth} from "../../hooks/useAuth.ts";

const InstructorsPage = () => {

    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { userRole } = useAuth();
    const canEdit = userRole === "ADMIN";

    useEffect(() => {
        setLoading(true);
        getInstructors()
            .then((data) => setInstructors(Array.isArray(data) ? data : []))
            .catch(() => toast.error("Failed to fetch instructors"))
            .finally(() => setLoading(false));
    }, [])

    //should be memoized or stable
    const columns = useMemo<MRT_ColumnDef<Instructor>[]>(
        () => [
            {
                accessorKey: 'id', //access nested data with dot notation
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
                        onClick={() => navigate(`/instructors/${row.original.uuid}`)}
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
                id: 'role',
                accessorFn: (row: any) => {
                    const user = row.userReadOnlyDTO;
                    return user?.role || '-';
                },
                header: 'Role',
            },
            {
                id: 'vat',
                accessorFn: (row: any) => {
                    const user = row.userReadOnlyDTO;
                    return user?.vat || '-';
                },
                header: 'Vat',
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
            },
        ],
        [navigate, canEdit],
    );

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5
    });

    const table = useMaterialReactTable({
        columns,
        data: instructors,
        onPaginationChange: setPagination,
        state: { pagination },
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
    });

    if (loading) {
        return (
            <div className="container mx-auto px-[5vw]">
                <h1 className="text-2xl text-center mt-12">Instructors</h1>
                <Loader />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-[5vw]">
            <h1 className="text-2xl text-center mt-12">Instructors</h1>
            <div className="flex justify-start my-6">
                <Button
                className="mt-1"
                disabled={!canEdit}
                title={!canEdit ? "Only ADMIN can add instructors" : undefined}
                onClick={() => navigate(`/instructors/new`)}
            >
                Add New
            </Button>
            </div>
            <MaterialReactTable table={table} />
        </div>
    )
};

export default InstructorsPage;
