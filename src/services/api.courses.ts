import type {Course} from "./../schemas/courses.ts";
import {API_BASE, apiFetch} from "./apiBase.ts";

export async function getCourses(): Promise<Course[]> {
    const res = await apiFetch(`${API_BASE}/courses/getAllCourses`, { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch courses");
    return await res.json();
}

export async function getCourse(id: number): Promise<Course> {
    const res = await apiFetch(`${API_BASE}/courses/${id}`, { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch course with id " + id);
    return await res.json();
}

export async function createCourse(data: Omit<Course, "id">) {
    const res = await apiFetch(`${API_BASE}/courses`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create a new course");
    return await res.json();
}

export async function updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const res = await apiFetch(`${API_BASE}/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update the course with id " + id);
    return await res.json();
}
