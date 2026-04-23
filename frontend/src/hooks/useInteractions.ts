import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInteractions, fetchAllInteractions, createInteraction, fetchLessonsLearned, workplaceCoaching, deleteInteraction } from "@/lib/api";

export function useInteractions(stakeholderId?: string) {
    return useQuery({
        queryKey: ['interactions', stakeholderId],
        queryFn: () => stakeholderId ? fetchInteractions(stakeholderId) : fetchAllInteractions(),
        enabled: true
    });
}

export function useAllInteractions() {
    return useQuery({
        queryKey: ['interactions', 'all'],
        queryFn: fetchAllInteractions
    });
}

export function useLessonsLearned() {
    return useQuery({
        queryKey: ['lessons_learned'],
        queryFn: fetchLessonsLearned
    });
}

export function useInteractionMutations(stakeholderId?: string) {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: createInteraction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
            queryClient.invalidateQueries({ queryKey: ['lessons_learned'] });
        }
    });

    const getCoaching = useMutation({
        mutationFn: workplaceCoaching
    });

    const remove = useMutation({
        mutationFn: deleteInteraction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
            queryClient.invalidateQueries({ queryKey: ['lessons_learned'] });
        }
    });

    return { create, getCoaching, remove };
}
