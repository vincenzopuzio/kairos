import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

export function usePrinciples() {
    const queryClient = useQueryClient()

    const principlesRequest = useQuery({
        queryKey: ['principles'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/principles/`)
            if (!res.ok) throw new Error('Failed to fetch principles')
            return res.json()
        }
    })

    const updatePrinciple = useMutation({
        mutationFn: async ({ id, ...data }: any) => {
            const res = await fetch(`${API_BASE}/principles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error('Failed to update principle')
            return res.json()
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['principles'] })
    })

    return {
        principles: principlesRequest.data || [],
        isLoading: principlesRequest.isLoading,
        updatePrinciple
    }
}
