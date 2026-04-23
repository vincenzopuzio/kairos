import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPrinciples, updatePrinciple, researchPrinciples, createGuidingPrinciple } from '@/lib/api'

export function usePrinciples(enabled = true) {
    const queryClient = useQueryClient()

    const principlesRequest = useQuery({
        queryKey: ['principles'],
        enabled,
        queryFn: fetchPrinciples
    })

    const updatePrincipleMutation = useMutation({
        mutationFn: ({ id, ...data }: any) => updatePrinciple(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['principles'] })
    })

    const createPrincipleMutation = useMutation({
        mutationFn: createGuidingPrinciple,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['principles'] })
    })

    const researchMutation = useMutation({
        mutationFn: researchPrinciples
    })

    return {
        principles: principlesRequest.data || [],
        isLoading: principlesRequest.isLoading,
        updatePrinciple: updatePrincipleMutation,
        createPrinciple: createPrincipleMutation,
        research: researchMutation
    }
}
