import { Video } from '@/contexts/VideosContext'
import { useVideos } from '@/hooks/useVideos'
import { Mic2, PlusCircle } from 'lucide-react'
import { ChangeEvent } from 'react'
import { VideoItem } from './VideoItem'

interface UploadVideosProps {
  isTranscribing: boolean
}

export function UploadVideos({ isTranscribing}: UploadVideosProps) {
  const { addFiles, videos, removeVideo } = useVideos()

  function handleVideoFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files

    if (!files) {
      return
    }

    addFiles(files)
  }

  const hasAnyVideoUploaded = videos.size !== 0

  return (
    <div className="relative flex flex-col gap-4">
      <div
        aria-disabled={hasAnyVideoUploaded}
        className='aria-disabled:cursor-not-allowed w-full'
      >
      <label
        htmlFor="videos"
        aria-disabled={hasAnyVideoUploaded}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-pink-800 px-4 py-3 text-sm font-medium text-white hover:bg-pink-700 aria-disabled:pointer-events-none"
      >
        <PlusCircle className="h-4 w-4 text-white" />
        Selecione os vídeos
      </label>

      </div>

      <input
        type="file"
        accept="video/*"
        multiple
        id="videos"
        className="invisible absolute top-0 h-0 w-0"
        onChange={handleVideoFilesSelected}
      />

      {!hasAnyVideoUploaded ? (
        <span className="inline-block text-center text-xs text-zinc-500">
          Nenhum vídeo selecionado
        </span>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {Array.from(videos.entries()).map(([id, video]) => {
            return (
              <VideoItem
                onRemove={(id) => {
                  removeVideo(id);
                }}
                id={id}
                key={id}
                video={video as Video}
              />
            )
          })}
        </div>
      )}

      {videos.size > 0  && (
        <button
          type="submit"
          disabled={isTranscribing}
          className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-pink-800 px-4 py-3 text-sm font-medium text-white hover:bg-pink-700 disabled:pointer-events-none"
        >
          <Mic2 className="h-4 w-4 text-white" />
          {isTranscribing
            ? 'Transcrevendo'
            : `Transcrever ${videos.size} vídeo(s)`}
        </button>

      )}
    </div>
  )
}
