import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import CreateCollectionModal from '../components/collections/CreateCollectionModal'
import { useCollections } from '../hooks/useCollections'
import { useSites } from '../hooks/useSites'
import { useTheme } from '../store/themeContext'

function relativeDate(ts) {
  if (!ts) return '-'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const days  = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7)  return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}개월 전`
}

// ─────────────────────────────────────────────
// 컬렉션 행 카드
// ─────────────────────────────────────────────
function CollectionRow({ col, onEdit, onDelete, onTogglePublic }) {
  const C = useTheme()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied]               = useState(false)
  const [toggling, setToggling]           = useState(false)

  const shareUrl = `${window.location.origin}/c/${col.shareSlug}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleToggle = async () => {
    setToggling(true)
    await onTogglePublic(col)
    setToggling(false)
  }

  return (
    <div style={{
      background: C.cardBg,
      border: C.cardBorder,
      borderRadius: C.cardRadius,
      padding: '20px 24px',
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = C.isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(83,74,183,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>

        {/* 공개/비공개 토글 */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          style={{
            flexShrink: 0, marginTop: 2,
            padding: '4px 10px', borderRadius: 999, border: 'none',
            background: col.isPublic ? (C.isDark ? '#1a3a0a' : '#EAF3DE') : (C.isDark ? '#2a2748' : '#f0f0f0'),
            color:      col.isPublic ? (C.isDark ? '#6dbf40' : '#3B6D11') : C.textMuted,
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.15s', opacity: toggling ? 0.6 : 1,
          }}
        >
          {col.isPublic ? '🌐 공개' : '🔒 비공개'}
        </button>

        {/* 제목 + 설명 + 메타 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {col.title}
          </div>
          {col.description && (
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {col.description}
            </div>
          )}

          {/* 통계 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {[
              { icon: '🔗', val: (col.siteSnapshots ?? []).length, label: '사이트' },
              { icon: '👁', val: col.viewCount  ?? 0, label: '조회'   },
              { icon: '❤',  val: col.likeCount  ?? 0, label: '좋아요' },
              { icon: '📥', val: col.saveCount  ?? 0, label: '저장'   },
            ].map(({ icon, val, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{val}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>{label}</span>
              </div>
            ))}
            <span style={{ fontSize: 11, color: C.textMuted }}>· {relativeDate(col.createdAt)} 생성</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          {confirmDelete ? (
            <>
              <span style={{ fontSize: 12, color: '#e53935', fontWeight: 600 }}>삭제할까요?</span>
              <button
                onClick={() => { onDelete(col.id); setConfirmDelete(false) }}
                style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: '#e53935', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >삭제</button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '6px 12px', borderRadius: 7, border: C.inputBorder, background: C.cardBg, color: C.textMuted, fontSize: 12, cursor: 'pointer' }}
              >취소</button>
            </>
          ) : (
            <>
              <button
                onClick={handleCopy}
                style={{
                  padding: '7px 13px', borderRadius: 8,
                  border: C.inputBorder,
                  background: copied ? C.primaryLight : C.cardBg,
                  color: copied ? C.primary : C.textMuted,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {copied ? '✓ 복사됨' : '🔗 링크'}
              </button>
              <button
                onClick={() => onEdit(col)}
                style={{ padding: '7px 13px', borderRadius: 8, border: C.inputBorder, background: C.cardBg, color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.subBorder}
              >
                ✎ 수정
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ padding: '7px 13px', borderRadius: 8, border: '1px solid rgba(229,57,53,0.3)', background: C.cardBg, color: '#e53935', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.isDark ? 'rgba(229,57,53,0.15)' : '#fff5f5' }}
                onMouseLeave={e => { e.currentTarget.style.background = C.cardBg }}
              >
                ✕ 삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MyCollections 페이지
// ─────────────────────────────────────────────
export default function MyCollections() {
  const C = useTheme()
  const navigate = useNavigate()
  const { collections, loading, createCollection, updateCollection, deleteCollection } = useCollections()
  const { sites } = useSites()

  const [showCreate, setShowCreate]       = useState(false)
  const [editingCol, setEditingCol]       = useState(null)

  const handleTogglePublic = async (col) => {
    await updateCollection(col.id, { isPublic: !col.isPublic })
  }

  const handleEditSave = async (data) => {
    await updateCollection(editingCol.id, data)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── 헤더 ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 2, marginBottom: 8 }}>MY COLLECTIONS</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: C.dark, margin: '0 0 6px', letterSpacing: '-0.4px' }}>내 컬렉션</h1>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
              {loading ? '불러오는 중...' : `${collections.length}개의 컬렉션을 관리하세요.`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/collections')}
              style={{ padding: '10px 18px', borderRadius: 10, border: C.inputBorder, background: C.cardBg, color: C.textSub, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              탐색하기
            </button>
            <button
              onClick={() => setShowCreate(true)}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(83,74,183,0.28)' }}
            >
              + 새 컬렉션
            </button>
          </div>
        </div>

        {/* ── 컬렉션 목록 ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 100, borderRadius: C.cardRadius, background: C.cardBg, border: C.cardBorder, opacity: 0.5 }} />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: C.cardBg, borderRadius: 20, border: C.cardBorder }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: '0 0 8px' }}>아직 컬렉션이 없어요</h3>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 24px' }}>
              즐겨 쓰는 사이트들을 모아 첫 컬렉션을 만들어보세요!
            </p>
            <button
              onClick={() => setShowCreate(true)}
              style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: C.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              첫 컬렉션 만들기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {collections.map(col => (
              <CollectionRow
                key={col.id}
                col={col}
                onEdit={setEditingCol}
                onDelete={deleteCollection}
                onTogglePublic={handleTogglePublic}
              />
            ))}
          </div>
        )}
      </main>

      {/* 생성 모달 */}
      {showCreate && (
        <CreateCollectionModal
          onClose={() => setShowCreate(false)}
          onSave={createCollection}
          sites={sites}
        />
      )}

      {/* 수정 모달 */}
      {editingCol && (
        <CreateCollectionModal
          initial={editingCol}
          onClose={() => setEditingCol(null)}
          onSave={handleEditSave}
          sites={sites}
        />
      )}
    </div>
  )
}
