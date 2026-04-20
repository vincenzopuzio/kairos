import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = "http://localhost:8000/api/v1";

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/projects/`);
            if (!res.ok) throw new Error("Failed to fetch projects");
            return res.json();
        }
    });
}

async function updateProjectReq({ id, ...data }: { id: string;[key: string]: any }) {
    const res = await fetch(`${API_URL}/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update project");
    return res.json();
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProjectReq,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_URL}/projects/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete project");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    })
}
export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`${API_URL}/projects/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create project");
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    })
}
