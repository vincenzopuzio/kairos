import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMilestones, createMilestone, updateMilestone, deleteMilestone, fetchProjectTemplates, applyProjectTemplate } from '@/lib/api';

export function useMilestones(projectId?: string, enabled = true) {
    return useQuery({
        queryKey: ['milestones', projectId],
        enabled: enabled && !!projectId,
        queryFn: () => fetchMilestones(projectId!)
    });
}

export function useProjectTemplates(enabled = true) {
    return useQuery({
        queryKey: ['project-templates'],
        enabled,
        queryFn: fetchProjectTemplates
    });
}

export function useMilestoneMutations(projectId?: string) {
    const queryClient = useQueryClient();
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
    };

    const create = useMutation({
        mutationFn: (data: any) => createMilestone(projectId!, data),
        onSuccess: invalidate
    });

    const update = useMutation({
        mutationFn: ({ id, ...data }: { id: string;[k: string]: any }) => updateMilestone(id, data),
        onSuccess: invalidate
    });

    const remove = useMutation({
        mutationFn: deleteMilestone,
        onSuccess: invalidate
    });

    const applyTemplate = useMutation({
        mutationFn: (templateId: string) => applyProjectTemplate(projectId!, templateId),
        onSuccess: invalidate
    });

    return { create, update, remove, applyTemplate };
}
