'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'

interface ExerciseVideoEmbedProps {
  youtubeId: string
  title: string
}

export function ExerciseVideoEmbed({ youtubeId, title }: ExerciseVideoEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`

  if (!loaded) {
    return (
      <button
        onClick={() => setLoaded(true)}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play size={28} fill="white" className="text-white mr-[-3px]" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          צפה בהדגמה
        </div>
      </button>
    )
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
