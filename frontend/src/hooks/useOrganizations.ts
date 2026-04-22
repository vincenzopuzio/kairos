import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchOrganizations, createOrganization, updateOrganization, deleteOrganization } from "../lib/api"

export function useOrganizations() {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: fetchOrganizations
    })
}

export function useCreateOrganization() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createOrganization,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] })
        }
    })
}

export function useUpdateOrganization() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateOrganization,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] })
        }
    })
}

export function useDeleteOrganization() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteOrganization,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] })
        }
    })
}
