import { useEffect, useRef, useState } from 'react'
import styles from './special.module.css'

import { SPECIAL_01_CLIPS, SPECIAL_01_MEDIA as MEDIA } from './clips'

const pad = (n: number) => String(n).padStart(2, '0')

function useWide() {
  const query = '(orientation: landscape)'
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches === true)
  useEffect(() => {
    const media = window.matchMedia?.(query)
    if (!media) return
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return wide
}

export function SpecialProjectPage() {
  const reelRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)
  const wide = useWide()
  const suffix = wide ? '-h' : ''
  const sections = SPECIAL_01_CLIPS.length + 2

  useEffect(() => {
    const reel = reelRef.current
    if (!reel || typeof IntersectionObserver === 'undefined') return
    const panels = [...reel.querySelectorAll<HTMLElement>('[data-panel]')]
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const index = panels.indexOf(entry.target as HTMLElement)
        const video = entry.target.querySelector('video')
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          setActive(index)
          if (video) {
            if (!video.src && video.dataset.src) video.src = video.dataset.src
            video.play().catch(() => {})
          }
          const next = panels[index + 1]?.querySelector('video')
          if (next && !next.src && next.dataset.src) { next.src = next.dataset.src; next.preload = 'auto' }
        } else if (video) {
          video.pause()
        }
      }
    }, { root: reel, threshold: [0, 0.6, 1] })
    panels.forEach((panel) => observer.observe(panel))
    return () => observer.disconnect()
  }, [wide])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied('Link copied.')
    } catch {
      setCopied('Copy this page’s address from your browser bar.')
    }
  }

  return (
    <section aria-labelledby="special-heading" className={styles.page}>
      <div className={styles.reel} ref={reelRef}>
        <article className={`${styles.panel} ${styles.plain}`} data-panel="">
          <div className={styles.mark}><span>WINTER · SPECIAL PROJECT 01</span></div>
          <div className={styles.cap}>
            <hr className={styles.rule} />
            <h1 id="special-heading">There is a door in this hood.</h1>
            <p>You found it. Behind it: a few real places in China, filmed as they are. Swipe slowly.</p>
          </div>
          <p className={styles.swipe}>SWIPE UP</p>
        </article>

        {SPECIAL_01_CLIPS.map((clip, index) => (
          <article className={styles.panel} data-panel="" key={`${clip.base}${suffix}`}>
            <video
              className={styles.video}
              data-src={`${MEDIA}${clip.base}${suffix}.mp4`}
              loop
              muted
              playsInline
              poster={`${MEDIA}${clip.base}${suffix}.jpg`}
              preload="none"
            />
            <div className={styles.meta}><span>{pad(index + 1)} / {pad(SPECIAL_01_CLIPS.length)}</span><span>{clip.photo ? 'PHOTOGRAPH' : 'FOOTAGE'}</span></div>
            {!wide ? <p className={styles.rotate}>TURN FOR THE WIDE VIEW</p> : null}
            <div className={styles.cap}>
              <p className={styles.label}>{clip.label}</p>
              <h2>{clip.title}</h2>
              <p>{clip.text}</p>
              <p className={styles.zh} lang="zh-CN">{clip.zh}</p>
            </div>
          </article>
        ))}

        <article className={`${styles.panel} ${styles.plain}`} data-panel="">
          <div className={styles.mark}><span>RE-VIEW</span></div>
          <div className={styles.cap}>
            <hr className={styles.rule} />
            <h2>Close the hood. Keep the view.</h2>
            <p>KAIROHOU keeps time two ways: kairos, the right moment, and hou (候), the old Chinese five-day season. Pieces are arranged not by category, but by the moment they belong to. This one belongs to winter.</p>
            <button className={styles.button} onClick={copyLink} type="button">COPY LINK</button>
            <p aria-live="polite" className={styles.small}>{copied ?? 'Footage: Pixabay contributors · Photograph: Hongwei Fan, Unsplash'}</p>
          </div>
        </article>
      </div>
      <div aria-hidden="true" className={styles.dots}>
        {Array.from({ length: sections }, (_, index) => <i className={index === active ? styles.on : undefined} key={index} />)}
      </div>
    </section>
  )
}
