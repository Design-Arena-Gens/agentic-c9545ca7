'use client'

import { useState, useRef, useEffect } from 'react'

interface Clip {
  id: number
  startTime: number
  endTime: number
  duration: number
}

export default function Home() {
  const [player, setPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [clips, setClips] = useState<Clip[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const videoId = 'BYizgB2FcAQ'

  useEffect(() => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    ;(window as any).onYouTubeIframeAPIReady = () => {
      const ytPlayer = new (window as any).YT.Player('youtube-player', {
        height: '480',
        width: '854',
        videoId: videoId,
        playerVars: {
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target)
            setDuration(event.target.getDuration())
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              startTimeTracking(event.target)
            } else {
              setIsPlaying(false)
              stopTimeTracking()
            }
          },
        },
      })
    }

    return () => {
      stopTimeTracking()
    }
  }, [])

  const startTimeTracking = (ytPlayer: any) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      const time = ytPlayer.getCurrentTime()
      setCurrentTime(time)
    }, 100)
  }

  const stopTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (!player) return
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  const handleSetStartTime = () => {
    setStartTime(currentTime)
  }

  const handleSetEndTime = () => {
    if (startTime === null) {
      alert('Please set a start time first')
      return
    }
    if (currentTime <= startTime) {
      alert('End time must be after start time')
      return
    }

    const newClip: Clip = {
      id: Date.now(),
      startTime: startTime,
      endTime: currentTime,
      duration: currentTime - startTime,
    }

    setClips([...clips, newClip])
    setStartTime(null)
  }

  const handlePlayClip = (clip: Clip) => {
    if (!player) return
    player.seekTo(clip.startTime, true)
    player.playVideo()

    setTimeout(() => {
      player.pauseVideo()
    }, clip.duration * 1000)
  }

  const handleDeleteClip = (id: number) => {
    setClips(clips.filter(clip => clip.id !== id))
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (player) {
      player.seekTo(time, true)
    }
  }

  const getYouTubeClipUrl = (clip: Clip) => {
    const start = Math.floor(clip.startTime)
    const end = Math.floor(clip.endTime)
    return `https://www.youtube.com/watch?v=${videoId}&t=${start}s`
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>YouTube Clip Maker</h1>

      <div style={styles.container}>
        <div style={styles.videoSection}>
          <div id="youtube-player" style={styles.videoPlayer}></div>

          <div style={styles.controls}>
            <button onClick={handlePlayPause} style={styles.button}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <div style={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            step="0.1"
            style={styles.seekBar}
          />

          <div style={styles.clipControls}>
            <button onClick={handleSetStartTime} style={styles.primaryButton}>
              Set Start Time
            </button>
            {startTime !== null && (
              <span style={styles.timeIndicator}>
                Start: {formatTime(startTime)}
              </span>
            )}
            <button
              onClick={handleSetEndTime}
              style={{...styles.primaryButton, ...styles.endButton}}
              disabled={startTime === null}
            >
              Set End Time & Create Clip
            </button>
          </div>
        </div>

        <div style={styles.clipsSection}>
          <h2 style={styles.subtitle}>Your Clips ({clips.length})</h2>

          {clips.length === 0 ? (
            <p style={styles.emptyState}>
              No clips yet. Set a start and end time to create your first clip!
            </p>
          ) : (
            <div style={styles.clipsList}>
              {clips.map((clip) => (
                <div key={clip.id} style={styles.clipCard}>
                  <div style={styles.clipInfo}>
                    <div style={styles.clipTitle}>
                      Clip {clips.indexOf(clip) + 1}
                    </div>
                    <div style={styles.clipTimes}>
                      {formatTime(clip.startTime)} → {formatTime(clip.endTime)}
                    </div>
                    <div style={styles.clipDuration}>
                      Duration: {formatTime(clip.duration)}
                    </div>
                  </div>
                  <div style={styles.clipActions}>
                    <button
                      onClick={() => handlePlayClip(clip)}
                      style={styles.smallButton}
                    >
                      ▶ Play
                    </button>
                    <a
                      href={getYouTubeClipUrl(clip)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.smallButton}
                    >
                      🔗 Open
                    </a>
                    <button
                      onClick={() => handleDeleteClip(clip.id)}
                      style={{...styles.smallButton, ...styles.deleteButton}}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: '100vh',
    padding: '2rem',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
    background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
  },
  videoSection: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    background: '#2d2d44',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontWeight: '600',
  },
  endButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  timeDisplay: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4ecdc4',
  },
  seekBar: {
    width: '100%',
    marginTop: '1rem',
    height: '8px',
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer',
  },
  clipControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: '#16213e',
    borderRadius: '8px',
  },
  timeIndicator: {
    fontSize: '1rem',
    color: '#4ecdc4',
    fontWeight: '600',
    textAlign: 'center',
  },
  clipsSection: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    maxHeight: '800px',
    overflow: 'auto',
  },
  subtitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#4ecdc4',
  },
  emptyState: {
    textAlign: 'center',
    color: '#888',
    padding: '2rem',
    lineHeight: '1.6',
  },
  clipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  clipCard: {
    background: '#16213e',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #2d2d44',
  },
  clipInfo: {
    marginBottom: '1rem',
  },
  clipTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#fff',
  },
  clipTimes: {
    fontSize: '0.9rem',
    color: '#4ecdc4',
    marginBottom: '0.25rem',
  },
  clipDuration: {
    fontSize: '0.85rem',
    color: '#888',
  },
  clipActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  smallButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    background: '#2d2d44',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textDecoration: 'none',
    display: 'inline-block',
  },
  deleteButton: {
    background: '#e74c3c',
  },
}
