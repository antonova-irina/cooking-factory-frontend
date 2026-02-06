import type {Student} from "../schemas/students.ts";
import {API_BASE, apiFetch} from "./apiBase.ts";

export async function getStudents(): Promise<Student[]> {
    const res = await apiFetch(`${API_BASE}/students/getAllStudents`, { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch students");
    return await res.json();
}

export async function getStudent(uuid: string): Promise<Student> {
    const res = await apiFetch(`${API_BASE}/students/${uuid}`);
    if (!res.ok) throw new Error("Failed to fetch student with uuid " + uuid);
    return await res.json();
}

export async function createStudent(data: Omit<Student, "id" | "uuid">) {
    const res = await apiFetch(`${API_BASE}/students`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add a new student");
    return await res.json();
}

export async function updateStudent(uuid: string, data: Partial<Student>): Promise<Student> {
    const res = await apiFetch(`${API_BASE}/students/${uuid}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update the student with uuid " + uuid);
    return await res.json();
}
