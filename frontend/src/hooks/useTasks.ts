import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, fetchProjects } from '@/lib/api'

export function useTasks(includeBlocked = true) {
    return useQuery({
        queryKey: ['tasks', includeBlocked],
        queryFn: () => fetchTasks(includeBlocked),
    })
}

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects,
    })
}

export function useCreateTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            // Intelligently invalidates task queues natively to trigger refetch via React Query cache
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
    })
}
