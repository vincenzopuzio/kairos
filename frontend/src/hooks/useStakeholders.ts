import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchStakeholders, createStakeholder, updateStakeholder, deleteStakeholder } from "../lib/api"

export function useStakeholders() {
    return useQuery({
        queryKey: ['stakeholders'],
        queryFn: fetchStakeholders
    })
}

export function useCreateStakeholder() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createStakeholder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stakeholders'] })
        }
    })
}

export function useUpdateStakeholder() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateStakeholder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stakeholders'] })
        }
    })
}

export function useDeleteStakeholder() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteStakeholder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stakeholders'] })
        }
    })
}
