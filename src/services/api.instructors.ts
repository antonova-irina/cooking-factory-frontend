import type {Instructor} from "../schemas/instructors.ts";
import {API_BASE, apiFetch} from "./apiBase.ts";

export async function getInstructors(): Promise<Instructor[]> {
    const res = await apiFetch(`${API_BASE}/instructors/getAllInstructors`, { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch instructors");
    return await res.json();
}

export async function getInstructor(uuid: string): Promise<Instructor> {
    const res = await apiFetch(`${API_BASE}/instructors/${uuid}`);
    if (!res.ok) throw new Error("Failed to fetch instructor with uuid " + uuid);
    return await res.json();
}

export async function createInstructor(data: Omit<Instructor, "id" | "uuid">) {
    const res = await apiFetch(`${API_BASE}/instructors`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add a new instructor");
    return await res.json();
}

export async function updateInstructor(uuid: string, data: Partial<Instructor>): Promise<Instructor> {
    const res = await apiFetch(`${API_BASE}/instructors/${uuid}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update the instructor with uuid " + uuid);
    return await res.json();
}
