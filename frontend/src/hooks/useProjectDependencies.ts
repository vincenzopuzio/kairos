import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = "http://localhost:8000/api/v1";

export function useProjectDependencies(projectId?: string) {
    return useQuery({
        queryKey: ['project-deps', projectId],
        enabled: !!projectId,
        queryFn: async () => {
            const res = await fetch(`${API_URL}/projects/${projectId}/dependencies`);
            if (!res.ok) throw new Error("Failed to fetch dependencies");
            return res.json();
        }
    });
}

export function useProjectDependencyMutations(projectId?: string) {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['project-deps', projectId] });

    const add = useMutation({
        mutationFn: async (dependsOnId: string) => {
            const res = await fetch(`${API_URL}/projects/${projectId}/dependencies/${dependsOnId}`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to add dependency");
            return res.json();
        },
        onSuccess: invalidate
    });

    const remove = useMutation({
        mutationFn: async (dependsOnId: string) => {
            const res = await fetch(`${API_URL}/projects/${projectId}/dependencies/${dependsOnId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove dependency");
        },
        onSuccess: invalidate
    });

    return { add, remove };
}
