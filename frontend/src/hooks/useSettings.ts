import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSettings, updateSettings } from "../lib/api"

export function useOsSettings() {
    return useQuery({
        queryKey: ['os_settings'],
        queryFn: fetchSettings
    })
}

export function useUpdateOsSettings() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['os_settings'] })
        }
    })
}
