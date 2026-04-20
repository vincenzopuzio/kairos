import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = "http://localhost:8000/api/v1";

export function useKnowledgeEntries(search?: string, tag?: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    return useQuery({
        queryKey: ['knowledge', search, tag],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/kb/?${params}`);
            if (!res.ok) throw new Error("Failed to fetch KB");
            return res.json();
        }
    });
}

async function createEntry(data: any) {
    const res = await fetch(`${API_URL}/kb/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error("Failed to create entry");
    return res.json();
}

async function updateEntry({ id, ...data }: { id: string;[k: string]: any }) {
    const res = await fetch(`${API_URL}/kb/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error("Failed to update entry");
    return res.json();
}

async function deleteEntry(id: string) {
    const res = await fetch(`${API_URL}/kb/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete entry");
}

async function askKb(query: string) {
    const res = await fetch(`${API_URL}/ai/ask-kb`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
    if (!res.ok) throw new Error("KB AI search failed");
    return res.json();
}

function useKbMutations() {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    return {
        useCreate: () => useMutation({ mutationFn: createEntry, onSuccess: invalidate }),
        useUpdate: () => useMutation({ mutationFn: updateEntry, onSuccess: invalidate }),
        useDelete: () => useMutation({ mutationFn: deleteEntry, onSuccess: invalidate }),
        useAsk: () => useMutation({ mutationFn: askKb }),
    };
}

export { useKbMutations };
