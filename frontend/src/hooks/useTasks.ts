import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, fetchProjects, updateTask, updateProject, deleteProject as deleteProjectReq, createProject as createProjectReq, fetchProjectDetail, deleteTask as deleteTaskReq, ingestTasks } from '@/lib/api'

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
        enabled,
        staleTime: 0,
        refetchOnMount: 'always'
    })
}

export function useProjectDetail(projectId?: string) {
    return useQuery({
        queryKey: ['projects', projectId],
        queryFn: () => projectId ? fetchProjectDetail(projectId) : null,
        enabled: !!projectId,
        staleTime: 0
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

export function useDeleteTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteTaskReq,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
    })
}

export function useIngestTasks() {
    return useMutation({
        mutationFn: ingestTasks,
    })
}
