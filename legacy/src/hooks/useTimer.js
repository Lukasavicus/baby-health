import { useEffect, useRef, useState } from 'react'

export function useTimer(initialSeconds = 0, isActive = false) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(isActive)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const start = () => setIsRunning(true)
  const pause = () => setIsRunning(false)
  const reset = () => {
    setSeconds(0)
    setIsRunning(false)
  }
  const resume = () => setIsRunning(true)

  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600)
    const minutes = Math.floor((secs % 3600) / 60)
    const seconds = secs % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    resume,
    formatTime: formatTime(seconds),
    setSeconds,
  }
}
