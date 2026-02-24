'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { Pause } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

// 扩展音乐列表，包含路径和显示名称
const MUSIC_LIST = [
  { path: '/music/close-to-you.mp3', name: 'Close To You' },
  // 可以继续添加更多歌曲，例如：
  // { path: '/music/summer-breeze.mp3', name: 'Summer Breeze' },
  // { path: '/music/autumn-leaves.mp3', name: 'Autumn Leaves' },
]

export default function MusicCard() {
  const pathname = usePathname()
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const styles = cardStyles.musicCard
  const hiCardStyles = cardStyles.hiCard
  const clockCardStyles = cardStyles.clockCard
  const calendarCardStyles = cardStyles.calendarCard

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showList, setShowList] = useState(false) // 控制弹出层显示

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentIndexRef = useRef(0)

  const isHomePage = pathname === '/'
  const currentMusic = MUSIC_LIST[currentIndex]

  const position = useMemo(() => {
    // If not on home page, always position at bottom-right corner when playing
    if (!isHomePage) {
      return {
        x: center.width - styles.width - 16,
        y: center.height - styles.height - 16
      }
    }

    // Default position on home page
    return {
      x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
      y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
    }
  }, [isPlaying, isHomePage, center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

  const { x, y } = position

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      const nextIndex = (currentIndexRef.current + 1) % MUSIC_LIST.length
      currentIndexRef.current = nextIndex
      setCurrentIndex(nextIndex)
      setProgress(0)
    }

    const handleTimeUpdate = () => {
      updateProgress()
    }

    const handleLoadedMetadata = () => {
      updateProgress()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  // Handle currentIndex change - load new audio
  useEffect(() => {
    currentIndexRef.current = currentIndex
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused
      audioRef.current.pause()
      audioRef.current.src = MUSIC_LIST[currentIndex].path
      audioRef.current.loop = false
      setProgress(0)

      if (wasPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentIndex])

  // Handle play/pause state change
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // 点击外部关闭弹出层
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showList && !(e.target as Element).closest('.music-list-popup')) {
        setShowList(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showList])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // 处理卡片主体点击（切换弹出层）
  const handleCardClick = () => {
    setShowList(!showList)
  }

  // 选择歌曲
  const handleSelectSong = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(true) // 选择后自动播放
    setShowList(false)
  }

  // Hide component if not on home page and not playing
  if (!isHomePage && !isPlaying) {
    return null
  }

  return (
    <HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
      <Card
        order={styles.order}
        width={styles.width}
        height={styles.height}
        x={x}
        y={y}
        className={clsx('relative flex items-center gap-3', !isHomePage && 'fixed')}
      >
        {siteContent.enableChristmas && (
          <>
            <img
              src='/images/christmas/snow-10.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute'
              style={{ width: 120, left: -8, top: -12, opacity: 0.8 }}
            />
            <img
              src='/images/christmas/snow-11.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute'
              style={{ width: 80, right: -10, top: -12, opacity: 0.8 }}
            />
          </>
        )}

        {/* 卡片主体 - 点击弹出列表 */}
        <div
          className='flex items-center gap-3 flex-1 cursor-pointer'
          onClick={handleCardClick}
        >
          <MusicSVG className='h-8 w-8' />

          <div className='flex-1'>
            <div className='text-secondary text-sm'>{currentMusic.name}</div>

            <div className='mt-1 h-2 rounded-full bg-white/60'>
              <div
                className='bg-linear h-full rounded-full transition-all duration-300'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation() // 防止触发卡片点击
              togglePlayPause()
            }}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'
          >
            {isPlaying ? (
              <Pause className='text-brand h-4 w-4' />
            ) : (
              <PlaySVG className='text-brand ml-1 h-4 w-4' />
            )}
          </button>
        </div>

        {/* 歌曲列表弹出层 */}
        {showList && (
          <div className='music-list-popup absolute left-0 top-full mt-1 w-full bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
            {MUSIC_LIST.map((item, index) => (
              <div
                key={item.path}
                className={clsx(
                  'px-4 py-2 hover:bg-gray-100 cursor-pointer',
                  index === currentIndex && 'font-bold text-brand'
                )}
                onClick={() => handleSelectSong(index)}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </Card>
    </HomeDraggableLayer>
  )
}