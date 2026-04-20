import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, fetchProjects, updateTask, updateProject, deleteProject as deleteProjectReq, createProject as createProjectReq } from '@/lib/api'

export function useTasks(enabled = true, includeBlocked = true, projectId?: string, parentId?: string) {
    return useQuery({
        queryKey: ['tasks', includeBlocked, projectId, parentId],
        queryFn: () => fetchTasks(includeBlocked, projectId, parentId),
        enabled
    })
}

export function useProjects(enabled = true) {
    return useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects,
        enabled
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

export function useUpdateProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => updateProject(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteProjectReq,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    })
}

export function useCreateProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createProjectReq,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    })
}
