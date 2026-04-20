import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjectDependencies, addProjectDependency, removeProjectDependency } from '@/lib/api';

export function useProjectDependencies(projectId?: string, enabled = true) {
    return useQuery({
        queryKey: ['project-deps', projectId],
        enabled: enabled && !!projectId,
        queryFn: () => fetchProjectDependencies(projectId!)
    });
}

export function useProjectDependencyMutations(projectId?: string) {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['project-deps', projectId] });

    const add = useMutation({
        mutationFn: (dependsOnId: string) => addProjectDependency(projectId!, dependsOnId),
        onSuccess: invalidate
    });

    const remove = useMutation({
        mutationFn: (dependsOnId: string) => removeProjectDependency(projectId!, dependsOnId),
        onSuccess: invalidate
    });

    return { add, remove };
}
