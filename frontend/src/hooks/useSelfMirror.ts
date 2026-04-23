import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api'

export function useTraits() {
    return useQuery({
        queryKey: ['traits'],
        queryFn: () => request('/self-mirror/traits')
    })
}

export function useTraitDetail(traitId: string | null) {
    return useQuery({
        queryKey: ['traits', traitId],
        queryFn: () => request(`/self-mirror/traits/${traitId}`),
        enabled: !!traitId
    })
}

export function useCreateTrait() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => request('/self-mirror/traits', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['traits'] })
        }
    })
}

export function useUpdateTrait(traitId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => request(`/self-mirror/traits/${traitId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['traits'] })
            queryClient.invalidateQueries({ queryKey: ['traits', traitId] })
        }
    })
}

export function useDeleteTrait() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (traitId: string) => request(`/self-mirror/traits/${traitId}`, {
            method: 'DELETE'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['traits'] })
        }
    })
}

export function useCreateAudit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => request('/self-mirror/audits', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['traits'] })
            queryClient.invalidateQueries({ queryKey: ['traits', variables.trait_id] })
        }
    })
}

export function useGrowthAdvisory() {
    return useMutation({
        mutationFn: () => request('/self-mirror/advisory', {
            method: 'POST'
        })
    })
}
