import { VideosContext } from "@/contexts/VideosContext"
import { useContext } from "react"

export function useVideos() {
  const context = useContext(VideosContext)

  return context
}
