import { useQuery } from "@tanstack/react-query"
import { fetchTimeline } from "../lib/api"

export function useTimeline() {
    return useQuery({
        queryKey: ['timeline'],
        queryFn: fetchTimeline
    })
}
