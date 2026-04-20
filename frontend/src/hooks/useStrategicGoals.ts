import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchStrategicGoals, createStrategicGoal, updateStrategicGoal, deleteStrategicGoal } from "../lib/api"

export function useStrategicGoals() {
    return useQuery({
        queryKey: ['strategic_goals'],
        queryFn: fetchStrategicGoals
    })
}

export function useCreateStrategicGoal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createStrategicGoal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['strategic_goals'] })
        }
    })
}

export function useUpdateStrategicGoal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateStrategicGoal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['strategic_goals'] })
        }
    })
}

export function useDeleteStrategicGoal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteStrategicGoal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['strategic_goals'] })
        }
    })
}
