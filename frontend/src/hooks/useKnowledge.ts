import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchKb, createKbEntry, updateKbEntry, deleteKbEntry, askKb } from '@/lib/api';

export function useKnowledgeEntries(search?: string, tag?: string, enabled = true) {
    return useQuery({
        queryKey: ['knowledge', search, tag],
        enabled,
        queryFn: () => fetchKb(search, tag)
    });
}

export function useKbMutations() {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['knowledge'] });

    const useCreate = () => useMutation({
        mutationFn: createKbEntry,
        onSuccess: invalidate
    });

    const useUpdate = () => useMutation({
        mutationFn: ({ id, ...data }: { id: string;[k: string]: any }) => updateKbEntry(id, data),
        onSuccess: invalidate
    });

    const useDelete = () => useMutation({
        mutationFn: deleteKbEntry,
        onSuccess: invalidate
    });

    const useAsk = () => useMutation({
        mutationFn: askKb
    });

    return { useCreate, useUpdate, useDelete, useAsk };
}
