import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = "http://localhost:8000/api/v1";

export function useMilestones(projectId?: string) {
    return useQuery({
        queryKey: ['milestones', projectId],
        enabled: !!projectId,
        queryFn: async () => {
            const res = await fetch(`${API_URL}/projects/${projectId}/milestones`);
            if (!res.ok) throw new Error("Failed to fetch milestones");
            return res.json();
        }
    });
}

export function useProjectTemplates() {
    return useQuery({
        queryKey: ['project-templates'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/project-templates`);
            if (!res.ok) throw new Error("Failed to fetch templates");
            return res.json();
        }
    });
}

export function useMilestoneMutations(projectId?: string) {
    const queryClient = useQueryClient();
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
    };

    const create = useMutation({
        mutationFn: async (data: { title: string; target_date?: string; order?: number }) => {
            const res = await fetch(`${API_URL}/projects/${projectId}/milestones`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create milestone");
            return res.json();
        },
        onSuccess: invalidate
    });

    const update = useMutation({
        mutationFn: async ({ id, ...data }: { id: string;[k: string]: any }) => {
            const res = await fetch(`${API_URL}/milestones/${id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to update milestone");
            return res.json();
        },
        onSuccess: invalidate
    });

    const remove = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_URL}/milestones/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete milestone");
        },
        onSuccess: invalidate
    });

    const applyTemplate = useMutation({
        mutationFn: async (templateId: string) => {
            const res = await fetch(`${API_URL}/projects/${projectId}/apply-template/${templateId}`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to apply template");
            return res.json();
        },
        onSuccess: invalidate
    });

    return { create, update, remove, applyTemplate };
}
