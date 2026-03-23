import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../../hooks/useCategories'
import { FaviconImg } from '../../utils/favicon'
import { generateSlug } from '../../hooks/useCollections'
import { useTheme } from '../../store/themeContext'

function DoneView({ shareSlug, onClose }) {
  const C        = useTheme()
  const navigate  = useNavigate()
  const shareUrl  = `${window.location.origin}/c/${shareSlug}`
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '8px 0 4px' }}>
      <div style={{ fontSize: 40 }}>🎉</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 6 }}>컬렉션이 만들어졌어요!</div>
        <div style={{ fontSize: 13, color: C.textMuted }}>공유 링크로 누구든 볼 수 있어요.</div>
      </div>

      <div style={{ width: '100%', background: C.rowHoverBg, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, fontSize: 12, color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {shareUrl}
        </span>
        <button
          onClick={copy}
          style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 7, border: 'none',
            background: copied ? '#4caf50' : C.primary, color: '#fff',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
          }}
        >
          {copied ? '복사됨 ✓' : '복사'}
        </button>
      </div>

      <button
        onClick={() => {
          const text = encodeURIComponent(`내 사이트 컬렉션을 공유합니다 🔗`)
          const url  = encodeURIComponent(shareUrl)
          window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener')
        }}
        style={{ width: '100%', padding: '10px', borderRadius: C.btnRadius, border: C.inputBorder, background: C.cardBg, color: '#1DA1F2', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
      >
        𝕏 트위터에 공유
      </button>

      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <button
          onClick={onClose}
          style={{ flex: 1, padding: '10px', borderRadius: C.btnRadius, border: C.inputBorder, background: C.cardBg, color: C.textSub, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          닫기
        </button>
        <button
          onClick={() => { onClose(); navigate(`/c/${shareSlug}`) }}
          style={{ flex: 2, padding: '10px', borderRadius: C.btnRadius, border: 'none', background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          공유 페이지 보기 →
        </button>
      </div>
    </div>
  )
}

export default function CreateCollectionModal({ onClose, onSave, sites, initial = null }) {
  const isEdit = !!initial
  const C      = useTheme()
  const { categories } = useCategories()

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: C.inputBorder, borderRadius: 8, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    background: C.inputBg, color: C.textPrimary,
  }
  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 5, display: 'block',
  }

  const [title, setTitle]           = useState(initial?.title ?? '')
  const [description, setDesc]      = useState(initial?.description ?? '')
  const [isPublic, setIsPublic]     = useState(initial?.isPublic ?? true)
  const [slug, setSlug]             = useState(initial?.shareSlug ?? '')
  const [slugLocked, setSlugLocked] = useState(isEdit)
  const [selectedIds, setSelectedIds] = useState(new Set(initial?.siteIds ?? []))
  const [activeCat, setActiveCat]   = useState(null)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [savedSlug, setSavedSlug]   = useState(null)

  useEffect(() => {
    if (!slugLocked) {
      const base = title.trim().replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '').slice(0, 40)
      setSlug(base)
    }
  }, [title, slugLocked])

  const filteredSites = activeCat
    ? sites.filter(s => s.category === activeCat)
    : sites

  const toggleSite = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (filteredSites.every(s => selectedIds.has(s.id))) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filteredSites.forEach(s => next.delete(s.id))
        return next
      })
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filteredSites.forEach(s => next.add(s.id))
        return next
      })
    }
  }

  const allChecked = filteredSites.length > 0 && filteredSites.every(s => selectedIds.has(s.id))

  const handleSave = async () => {
    if (!title.trim())         { setError('제목을 입력해주세요.'); return }
    if (selectedIds.size === 0) { setError('사이트를 1개 이상 선택해주세요.'); return }

    setSaving(true)
    setError('')
    try {
      const finalSlug     = slugLocked && slug.trim() ? slug.trim() : generateSlug(title)
      const selected      = sites.filter(s => selectedIds.has(s.id))
      const siteSnapshots = selected.map(s => ({
        id: s.id, name: s.name, url: s.url,
        category: s.category, memo: s.memo ?? '',
      }))

      await onSave({
        title: title.trim(),
        description: description.trim(),
        isPublic,
        shareSlug: finalSlug,
        siteIds:      [...selectedIds],
        siteSnapshots,
      })

      if (isEdit) {
        onClose()
      } else {
        setSavedSlug(finalSlug)
      }
    } catch {
      setError('저장 중 오류가 발생했습니다.')
      setSaving(false)
    }
  }

  if (savedSlug) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div style={{ background: C.cardBg, borderRadius: 16, padding: '36px 28px', width: '100%', maxWidth: 440, boxShadow: C.isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(83,74,183,0.2)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', border: C.cardBorder }}>
          <DoneView shareSlug={savedSlug} onClose={onClose} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: C.cardBg, borderRadius: 16,
        width: '100%', maxWidth: 560,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: C.isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(83,74,183,0.18)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        border: C.cardBorder,
      }}>

        {/* ── 헤더 ── */}
        <div style={{ padding: '24px 28px 20px', borderBottom: C.inputBorder, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>
            {isEdit ? '컬렉션 수정' : '컬렉션 만들기'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.textMuted, lineHeight: 1 }}>✕</button>
        </div>

        {/* ── 본문 (스크롤) ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={labelStyle}>컬렉션 제목 *</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={inputStyle}
                  placeholder="개발자가 매일 쓰는 사이트 모음"
                  value={title}
                  onChange={e => setTitle(e.target.value.slice(0, 40))}
                  maxLength={40}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.textMuted }}>
                  {title.length}/40
                </span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>한 줄 설명 (선택)</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={inputStyle}
                  placeholder="매일 써먹는 개발 도구들을 모았어요"
                  value={description}
                  onChange={e => setDesc(e.target.value.slice(0, 80))}
                  maxLength={80}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.textMuted }}>
                  {description.length}/80
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={labelStyle}>슬러그 (URL)</label>
                <input
                  style={{ ...inputStyle, fontSize: 12, color: slug ? C.primary : C.textMuted }}
                  value={slug}
                  placeholder="my-collection"
                  onChange={e => { setSlug(e.target.value); setSlugLocked(true) }}
                />
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>
                  /c/<span style={{ color: slug ? C.primary : C.textMuted }}>{slug || 'my-collection'}</span>
                </div>
              </div>

              <div style={{ flexShrink: 0 }}>
                <label style={labelStyle}>공개 여부</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[{ label: '공개', val: true }, { label: '비공개', val: false }].map(({ label, val }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setIsPublic(val)}
                      style={{
                        padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${isPublic === val ? C.primary : C.subBorder}`,
                        background: isPublic === val ? C.primary : C.cardBg,
                        color:      isPublic === val ? '#fff' : C.textSub,
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ ...labelStyle, margin: 0 }}>
                  사이트 선택
                  {selectedIds.size > 0 && (
                    <span style={{ marginLeft: 8, color: C.primary, fontWeight: 700 }}>{selectedIds.size}개 선택됨</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  style={{ fontSize: 11, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  {allChecked ? '전체 해제' : '전체 선택'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveCat(null)}
                  style={{
                    padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, transition: 'all 0.12s',
                    background: !activeCat ? C.primary : C.rowHoverBg,
                    color:      !activeCat ? '#fff' : C.textSub,
                  }}
                >
                  전체
                </button>
                {categories.map(cat => {
                  const on    = activeCat === cat.name
                  const count = sites.filter(s => s.category === cat.name).length
                  if (count === 0) return null
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCat(cat.name)}
                      style={{
                        padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, transition: 'all 0.12s',
                        background: on ? C.primary : C.rowHoverBg,
                        color:      on ? '#fff' : C.textSub,
                      }}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  )
                })}
              </div>

              {sites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: C.textMuted, fontSize: 13 }}>
                  등록된 사이트가 없어요.
                </div>
              ) : filteredSites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: C.textMuted, fontSize: 13 }}>
                  해당 카테고리에 사이트가 없어요.
                </div>
              ) : (
                <div style={{ border: C.inputBorder, borderRadius: 10, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
                  {filteredSites.map((site, i) => {
                    const checked = selectedIds.has(site.id)
                    return (
                      <label
                        key={site.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 14px', cursor: 'pointer',
                          background: checked ? C.primaryLight : C.cardBg,
                          borderBottom: i < filteredSites.length - 1 ? `0.5px solid ${C.divider}` : 'none',
                          transition: 'background 0.1s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSite(site.id)}
                          style={{ width: 15, height: 15, accentColor: C.primary, flexShrink: 0 }}
                        />
                        <FaviconImg
                          url={site.url}
                          style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'contain', background: C.bg, flexShrink: 0 }}
                          fallback={<div style={{ width: 20, height: 20, borderRadius: 4, background: C.primaryLight, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🌐</div>}
                        />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {site.name}
                        </span>
                        <span style={{ fontSize: 10, color: C.textMuted, flexShrink: 0 }}>
                          {site.category}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {error && <p style={{ fontSize: 12, color: '#e53935', margin: 0 }}>{error}</p>}
          </div>
        </div>

        {/* ── 푸터 ── */}
        <div style={{ padding: '16px 28px 20px', borderTop: C.inputBorder, display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '11px', borderRadius: C.btnRadius, border: C.inputBorder, background: C.cardBg, color: C.textSub, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 2, padding: '11px', borderRadius: C.btnRadius, border: 'none', background: C.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? '저장 중...' : (isEdit ? '수정하기' : '컬렉션 만들기')}
          </button>
        </div>
      </div>
    </div>
  )
}
