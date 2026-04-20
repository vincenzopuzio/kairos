import { useMutation } from '@tanstack/react-query'
import { dailyPlanner, weeklyPlanner, quarterlyRoadmap, strategicChat } from '@/lib/api'

export function useGeneratePlanner() {
    return useMutation({
        mutationFn: dailyPlanner
    })
}

export function useGenerateWeeklyPlanner() {
    return useMutation({
        mutationFn: weeklyPlanner
    })
}

export function useGenerateQuarterlyPlanner() {
    return useMutation({
        mutationFn: quarterlyRoadmap
    })
}

export function useStrategicChat() {
    return useMutation({
        mutationFn: ({ message, history }: { message: string, history?: any[] }) => strategicChat(message, history)
    })
}
