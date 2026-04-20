import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, fetchProjects, updateTask } from '@/lib/api'

export function useTasks(includeBlocked = true, projectId?: string, parentId?: string) {
    return useQuery({
        queryKey: ['tasks', includeBlocked, projectId, parentId],
        queryFn: () => fetchTasks(includeBlocked, projectId, parentId),
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

export function useUpdateTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
    })
}
