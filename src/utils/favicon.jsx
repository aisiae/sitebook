import { useState } from 'react'

function extractHostname(url) {
  try {
    const href = url?.startsWith('http') ? url : `https://${url}`
    return new URL(href).hostname
  } catch { return null }
}

// Clearbit Logo API URL 반환 (도메인 파싱 실패 시 null)
export function getFaviconUrl(url) {
  const host = extractHostname(url)
  return host ? `https://logo.clearbit.com/${host}` : null
}

// Clearbit → Google 순으로 시도, 모두 실패하면 fallback 렌더링
export function FaviconImg({ url, style, fallback = null }) {
  const [src, setSrc] = useState(() => getFaviconUrl(url))
  const [allFailed, setAllFailed] = useState(false)

  if (allFailed || !src) return fallback

  return (
    <img
      src={src}
      alt=""
      style={style}
      onError={() => {
        const host = extractHostname(url)
        if (src.includes('clearbit') && host) {
          setSrc(`https://www.google.com/s2/favicons?sz=64&domain=${host}`)
        } else {
          setAllFailed(true)
        }
      }}
    />
  )
}
