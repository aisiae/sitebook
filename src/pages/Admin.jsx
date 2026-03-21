import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/common/Navbar'
import { useDirectory } from '../hooks/useDirectory'
import { useCategories } from '../hooks/useCategories'
import { analyzeSite, getLoadingMessage } from '../utils/analyzeSite'

const C = {
  primary:      '#534AB7',
  primaryLight: '#EEEDFE',
  bg:           '#f5f4ff',
  dark:         '#2d2a6e',
  cardRadius:   '14px',
  btnRadius:    '10px',
}

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: on ? C.primary : '#d1d5db', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

function SectionHead({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: 1.2, textTransform: 'uppercase', borderBottom: '1px solid #f0eeff', paddingBottom: 8, marginBottom: 14 }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// Site Form modal
// ─────────────────────────────────────────────
const EMPTY = {
  name: '', url: '', icon: '', category: '', subcategory: '',
  shortDesc: '', fullDesc: '', howToUse: '', promotionText: '', tags: '',
  screenshots: [], relatedSites: [],
  isAd: false, adType: 'none',
  adBannerUrl: '', adBannerLink: '', adStartDate: '', adEndDate: '',
}

function initForm(initial) {
  if (!initial) return { ...EMPTY }
  return {
    ...EMPTY,
    ...initial,
    shortDesc:     initial.shortDesc || initial.description || '',
    subcategory:   initial.subcategory || '',
    promotionText: initial.promotionText || '',
    tags:          Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags ?? ''),
    screenshots:   Array.isArray(initial.screenshots)  ? [...initial.screenshots]  : [],
    relatedSites:  Array.isArray(initial.relatedSites) ? [...initial.relatedSites] : [],
    adType:        initial.adType || (initial.isAd ? 'banner' : 'none'),
  }
}

function SiteFormModal({ title, initial, allSites, onClose, onSave }) {
  const { categories } = useCategories()
  const [form, setForm]     = useState(() => initForm(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // AI 분석 state
  const [aiUrl, setAiUrl]           = useState(initial?.url ?? '')
  const [analyzing, setAnalyzing]   = useState(false)
  const [aiDone, setAiDone]         = useState(false)
  const [aiError, setAiError]       = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const handleAnalyze = async () => {
    const url = aiUrl.trim()
    if (!url) { setAiError('URL을 입력해주세요.'); return }
    if (!/^https?:\/\/.+/.test(url)) { setAiError('올바른 URL을 입력해주세요 (https://...)'); return }

    setAiError('')
    setAnalyzing(true)
    setAiDone(false)

    const start = Date.now()
    timerRef.current = setInterval(() => {
      setLoadingMsg(getLoadingMessage(Date.now() - start))
    }, 400)
    setLoadingMsg(getLoadingMessage(0))

    try {
      const result = await analyzeSite(url)
      clearInterval(timerRef.current)

      // categories 목록에서 매칭되는 카테고리 찾기
      const matchedCat = categories.find(c =>
        c.name === result.category ||
        c.name.includes(result.category) ||
        result.category?.includes(c.name)
      )

      setForm(f => ({
        ...f,
        url,
        name:          result.name          || f.name,
        category:      matchedCat?.name     || f.category,
        shortDesc:     result.shortDesc     || f.shortDesc,
        fullDesc:      result.fullDesc      || f.fullDesc,
        howToUse:      result.howToUse      || f.howToUse,
        promotionText: result.promotionText || f.promotionText,
        tags:          Array.isArray(result.tags) ? result.tags.join(', ') : f.tags,
      }))
      setAiDone(true)
    } catch (e) {
      clearInterval(timerRef.current)
      if (e.message === 'API_KEY_MISSING') {
        setAiError('API 키가 설정되지 않았습니다. .env에 VITE_GEMINI_API_KEY를 추가해주세요.')
      } else {
        setAiError('AI 분석에 실패했어요. 직접 입력해주세요.')
      }
    } finally {
      setAnalyzing(false)
    }
  }

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleCategoryChange = (e) => {
    setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))
  }

  const selectedCatObj = categories.find(c => c.name === form.category)
  const subcats = selectedCatObj?.subcategories ?? []

  // Screenshots
  const addShot    = () => setForm(f => ({ ...f, screenshots: [...f.screenshots, ''] }))
  const updateShot = (i, v) => setForm(f => { const a = [...f.screenshots]; a[i] = v; return { ...f, screenshots: a } })
  const removeShot = (i) => setForm(f => ({ ...f, screenshots: f.screenshots.filter((_, j) => j !== i) }))

  // Related sites
  const toggleRelated = (id) => setForm(f => ({
    ...f,
    relatedSites: f.relatedSites.includes(id)
      ? f.relatedSites.filter(x => x !== id)
      : [...f.relatedSites, id],
  }))

  const setAdType = (type) => setForm(f => ({ ...f, adType: type, isAd: type !== 'none' }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim() || !form.category) {
      setError('사이트명, URL, 카테고리는 필수입니다.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch {
      setError('저장 중 오류가 발생했습니다.')
      setSaving(false)
    }
  }

  const inp = { width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid #e0dff8', borderRadius: 8, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const lbl = { fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 5, display: 'block' }
  const otherSites = allSites.filter(s => s.id !== initial?.id)

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(83,74,183,0.18)', fontFamily: 'inherit', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── AI 자동 분석 ─────────────────── */}
          <section style={{ background: '#fafafe', border: '1.5px solid #e0dff8', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>✨ AI 자동 채우기</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...inp, flex: 1, background: '#fff' }}
                placeholder="https://notion.so"
                value={aiUrl}
                onChange={e => { setAiUrl(e.target.value); setAiError(''); setAiDone(false) }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAnalyze())}
                disabled={analyzing}
              />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                style={{
                  padding: '9px 16px', borderRadius: 8, border: 'none',
                  background: analyzing ? '#c4c0f0' : C.primary,
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: analyzing ? 'default' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {analyzing ? '분석 중...' : 'AI 분석'}
              </button>
            </div>

            {/* 로딩 */}
            {analyzing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#666' }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: `2px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {loadingMsg}
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {/* 완료 */}
            {aiDone && !analyzing && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#3B6D11', fontWeight: 600 }}>✅ AI 분석 완료! 아래 내용을 검토 후 수정하세요.</span>
                <button
                  type="button"
                  onClick={() => { setAiDone(false); handleAnalyze() }}
                  style={{ fontSize: 12, color: C.primary, background: 'none', border: `1px solid ${C.primary}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}
                >
                  다시 생성
                </button>
              </div>
            )}

            {/* 에러 */}
            {aiError && (
              <p style={{ fontSize: 12, color: '#e53935', margin: 0 }}>{aiError}</p>
            )}

            {/* 안내 (초기 상태) */}
            {!analyzing && !aiDone && !aiError && (
              <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>URL 입력 후 AI 분석 버튼을 클릭하면 모든 항목이 자동으로 채워져요.</p>
            )}
          </section>

          {/* ── 기본 정보 ─────────────────────── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionHead>기본 정보</SectionHead>
            <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>아이콘</label>
                <input style={{ ...inp, textAlign: 'center', fontSize: 22 }} placeholder="📝" maxLength={2} value={form.icon} onChange={set('icon')} />
              </div>
              <div>
                <label style={lbl}>사이트명 *</label>
                <input style={inp} placeholder="예: GitHub" value={form.name} onChange={set('name')} />
              </div>
            </div>
            <div>
              <label style={lbl}>URL *</label>
              <input
                style={inp}
                placeholder="https://example.com"
                value={form.url}
                onChange={e => { set('url')(e); setAiUrl(e.target.value) }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: subcats.length > 0 ? '1fr 1fr' : '1fr', gap: 12 }}>
              <div>
                <label style={lbl}>카테고리 *</label>
                <select style={{ ...inp, color: form.category ? '#1a1a2e' : '#aaa' }} value={form.category} onChange={handleCategoryChange}>
                  <option value="" disabled>카테고리 선택</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
              {subcats.length > 0 && (
                <div>
                  <label style={lbl}>서브카테고리</label>
                  <select style={{ ...inp, color: form.subcategory ? '#1a1a2e' : '#aaa' }} value={form.subcategory} onChange={set('subcategory')}>
                    <option value="">서브카테고리 선택 (선택)</option>
                    {subcats.map(sub => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label style={lbl}>한줄 소개 (카드에 표시)</label>
              <input style={inp} placeholder="서비스에 대한 한 줄 소개" value={form.shortDesc} onChange={set('shortDesc')} />
            </div>
            <div>
              <label style={lbl}>태그 (쉼표로 구분)</label>
              <input style={inp} placeholder="무료플랜, 협업, 모바일앱" value={form.tags} onChange={set('tags')} />
            </div>
          </section>

          {/* ── 상세 내용 ─────────────────────── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionHead>상세 내용</SectionHead>
            <div>
              <label style={lbl}>상세 소개</label>
              <textarea
                style={{ ...inp, minHeight: 100, resize: 'vertical', lineHeight: 1.65 }}
                placeholder="서비스에 대한 자세한 소개를 입력하세요..."
                value={form.fullDesc}
                onChange={set('fullDesc')}
              />
            </div>
            <div>
              <label style={lbl}>이용 방법</label>
              <textarea
                style={{ ...inp, minHeight: 80, resize: 'vertical', lineHeight: 1.65 }}
                placeholder={'1. 회원가입 후 로그인\n2. 새 페이지 만들기\n3. ...'}
                value={form.howToUse}
                onChange={set('howToUse')}
              />
            </div>
            <div>
              <label style={lbl}>홍보 문구</label>
              <textarea
                style={{ ...inp, minHeight: 64, resize: 'vertical', lineHeight: 1.65 }}
                placeholder="사용자를 끌어당기는 매력적인 홍보 문구..."
                value={form.promotionText}
                onChange={set('promotionText')}
              />
            </div>
          </section>

          {/* ── 스크린샷 ─────────────────────── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionHead>스크린샷 URL</SectionHead>
            {form.screenshots.map((url, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => updateShot(i, e.target.value)}
                />
                <button type="button" onClick={() => removeShot(i)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ffd5d5', background: '#fff5f5', color: '#e53935', cursor: 'pointer', flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addShot}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px dashed #c4c0f0', background: 'transparent', color: C.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              + URL 추가
            </button>
          </section>

          {/* ── 관련 사이트 ─────────────────── */}
          {otherSites.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionHead>관련 사이트</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 148, overflowY: 'auto', padding: '2px 0' }}>
                {otherSites.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, padding: '4px 0' }}>
                    <input
                      type="checkbox"
                      checked={form.relatedSites.includes(s.id)}
                      onChange={() => toggleRelated(s.id)}
                    />
                    <span style={{ fontSize: 15 }}>{s.icon || '🌐'}</span>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontSize: 11, color: '#bbb' }}>({s.category})</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* ── 광고 설정 ─────────────────────── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionHead>광고 설정</SectionHead>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'none',    label: '없음' },
                { value: 'banner',  label: '배너' },
                { value: 'premium', label: '프리미엄' },
              ].map(({ value, label }) => {
                const on = form.adType === value
                return (
                  <button key={value} type="button" onClick={() => setAdType(value)}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, border: on ? `2px solid ${C.primary}` : '1px solid #e0dff8', background: on ? C.primaryLight : '#fff', color: on ? C.primary : '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {label}
                  </button>
                )
              })}
            </div>
            {form.adType !== 'none' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, background: '#fafafe', borderRadius: 10, border: '1px solid #e0dff8' }}>
                <div>
                  <label style={lbl}>배너 이미지 URL</label>
                  <input style={inp} placeholder="https://..." value={form.adBannerUrl} onChange={set('adBannerUrl')} />
                </div>
                <div>
                  <label style={lbl}>배너 클릭 링크</label>
                  <input style={inp} placeholder="https://..." value={form.adBannerLink} onChange={set('adBannerLink')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={lbl}>광고 시작일</label>
                    <input type="date" style={inp} value={form.adStartDate} onChange={set('adStartDate')} />
                  </div>
                  <div>
                    <label style={lbl}>광고 종료일</label>
                    <input type="date" style={inp} value={form.adEndDate} onChange={set('adEndDate')} />
                  </div>
                </div>
              </div>
            )}
          </section>

          {error && <p style={{ fontSize: 12, color: '#e53935', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: C.btnRadius, border: '1px solid #e0dff8', background: '#fff', color: '#666', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              취소
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 2, padding: '11px', borderRadius: C.btnRadius, border: 'none', background: C.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? '저장 중...' : (initial ? '수정하기' : '추가하기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Category Manager
// ─────────────────────────────────────────────
function CategoryManager() {
  const { categories, loading, addCategory, updateCategory, deleteCategory, seedDefaults, moveCategory } = useCategories()

  const [newName, setNewName]   = useState('')
  const [newEmoji, setNewEmoji] = useState('')
  const [adding, setAdding]     = useState(false)
  const [editing, setEditing]   = useState(null)       // { id, name, emoji }
  const [expandedId, setExpandedId] = useState(null)
  const [newSubName, setNewSubName] = useState({})     // { [catId]: string }
  const [editingSub, setEditingSub] = useState(null)   // { catId, subId, name }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const inp = { padding: '8px 10px', fontSize: 13, border: '1px solid #e0dff8', borderRadius: 7, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4, display: 'block' }

  const handleAddCategory = async () => {
    if (!newName.trim()) return
    setAdding(true)
    await addCategory({ name: newName, emoji: newEmoji })
    setNewName(''); setNewEmoji('')
    setAdding(false)
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    await updateCategory(editing.id, { name: editing.name.trim(), emoji: editing.emoji.trim() || '📁' })
    setEditing(null)
  }

  const handleAddSub = async (catId) => {
    const name = (newSubName[catId] ?? '').trim()
    if (!name) return
    const cat = categories.find(c => c.id === catId)
    if (!cat) return
    const subs = cat.subcategories ?? []
    await updateCategory(catId, {
      subcategories: [...subs, { id: `s_${Date.now()}`, name, order: subs.length }]
    })
    setNewSubName(v => ({ ...v, [catId]: '' }))
  }

  const handleDeleteSub = async (catId, subId) => {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return
    await updateCategory(catId, { subcategories: cat.subcategories.filter(s => s.id !== subId) })
  }

  const handleSaveSubEdit = async () => {
    if (!editingSub) return
    const cat = categories.find(c => c.id === editingSub.catId)
    if (!cat) return
    await updateCategory(editingSub.catId, {
      subcategories: cat.subcategories.map(s =>
        s.id === editingSub.subId ? { ...s, name: editingSub.name.trim() } : s
      )
    })
    setEditingSub(null)
  }

  const smallBtn = (extra = {}) => ({
    padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', ...extra,
  })

  return (
    <div>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark, margin: '0 0 4px' }}>카테고리 관리</h2>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
            {loading ? '불러오는 중...' : `총 ${categories.length}개의 카테고리`}
          </p>
        </div>
        {!loading && categories.length === 0 && (
          <button
            onClick={seedDefaults}
            style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            기본 카테고리로 초기화
          </button>
        )}
      </div>

      {/* 카테고리 목록 */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(83,74,183,0.12)', borderRadius: C.cardRadius, overflow: 'hidden', marginBottom: 16 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
            <p style={{ fontSize: 14, color: '#888', margin: '0 0 16px' }}>카테고리가 없습니다.</p>
            <button onClick={seedDefaults}
              style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              기본값으로 초기화
            </button>
          </div>
        ) : (
          categories.map((cat, idx) => (
            <div key={cat.id}>
              {/* 카테고리 행 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                borderBottom: expandedId === cat.id ? '0.5px solid #f0eeff' : (idx < categories.length - 1 ? '0.5px solid #f8f7ff' : 'none'),
                background: expandedId === cat.id ? '#fafafe' : '#fff',
              }}>
                {/* ↑↓ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                  <button
                    onClick={() => moveCategory(cat.id, 'up')} disabled={idx === 0}
                    style={{ ...smallBtn({ background: 'none', border: '1px solid #e8e7f8', color: idx === 0 ? '#ddd' : '#888', padding: '2px 6px', fontSize: 10 }) }}
                  >↑</button>
                  <button
                    onClick={() => moveCategory(cat.id, 'down')} disabled={idx === categories.length - 1}
                    style={{ ...smallBtn({ background: 'none', border: '1px solid #e8e7f8', color: idx === categories.length - 1 ? '#ddd' : '#888', padding: '2px 6px', fontSize: 10 }) }}
                  >↓</button>
                </div>

                {editing?.id === cat.id ? (
                  <>
                    <input
                      value={editing.emoji}
                      onChange={e => setEditing(v => ({ ...v, emoji: e.target.value }))}
                      maxLength={2}
                      style={{ ...inp, width: 44, textAlign: 'center', fontSize: 18, flexShrink: 0 }}
                    />
                    <input
                      value={editing.name}
                      onChange={e => setEditing(v => ({ ...v, name: e.target.value }))}
                      style={{ ...inp, flex: 1 }}
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <button onClick={handleSaveEdit} style={{ ...smallBtn({ background: C.primary, color: '#fff' }) }}>저장</button>
                    <button onClick={() => setEditing(null)} style={{ ...smallBtn({ background: '#f0f0f0', color: '#666' }) }}>취소</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{cat.emoji}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.dark }}>{cat.name}</span>
                    <span style={{ fontSize: 11, color: '#bbb', whiteSpace: 'nowrap' }}>
                      서브 {cat.subcategories?.length ?? 0}개
                    </span>
                    <button
                      onClick={() => setEditing({ id: cat.id, name: cat.name, emoji: cat.emoji })}
                      style={{ ...smallBtn({ background: '#fff', border: '1px solid #e0dff8', color: C.primary }) }}
                    >수정</button>
                    {confirmDeleteId === cat.id ? (
                      <>
                        <button onClick={() => { deleteCategory(cat.id); setConfirmDeleteId(null) }}
                          style={{ ...smallBtn({ background: '#e53935', color: '#fff' }) }}>삭제 확인</button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          style={{ ...smallBtn({ background: '#f0f0f0', color: '#666' }) }}>취소</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(cat.id)}
                        style={{ ...smallBtn({ background: '#fff5f5', border: '1px solid #ffd5d5', color: '#e53935' }) }}>삭제</button>
                    )}
                    <button
                      onClick={() => setExpandedId(v => v === cat.id ? null : cat.id)}
                      style={{ ...smallBtn({ background: expandedId === cat.id ? C.primaryLight : '#f8f7ff', color: C.primary, border: `1px solid rgba(83,74,183,0.2)`, whiteSpace: 'nowrap' }) }}
                    >
                      서브카테고리 {expandedId === cat.id ? '▲' : '▼'}
                    </button>
                  </>
                )}
              </div>

              {/* 서브카테고리 패널 */}
              {expandedId === cat.id && (
                <div style={{ background: '#f8f7ff', padding: '12px 16px 14px 56px', borderBottom: idx < categories.length - 1 ? '0.5px solid #ebe9fc' : 'none' }}>
                  {(cat.subcategories ?? []).length === 0 && (
                    <p style={{ fontSize: 12, color: '#bbb', margin: '0 0 10px' }}>서브카테고리가 없습니다.</p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                    {(cat.subcategories ?? []).map(sub => (
                      <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {editingSub?.subId === sub.id ? (
                          <>
                            <input
                              value={editingSub.name}
                              onChange={e => setEditingSub(v => ({ ...v, name: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleSaveSubEdit()}
                              style={{ ...inp, flex: 1 }}
                              autoFocus
                            />
                            <button onClick={handleSaveSubEdit} style={{ ...smallBtn({ background: C.primary, color: '#fff' }) }}>저장</button>
                            <button onClick={() => setEditingSub(null)} style={{ ...smallBtn({ background: '#f0f0f0', color: '#666' }) }}>취소</button>
                          </>
                        ) : (
                          <>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, opacity: 0.4, flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 13, color: '#444' }}>{sub.name}</span>
                            <button
                              onClick={() => setEditingSub({ catId: cat.id, subId: sub.id, name: sub.name })}
                              style={{ ...smallBtn({ background: 'none', border: '1px solid #e0dff8', color: C.primary, padding: '3px 8px' }) }}
                            >수정</button>
                            <button
                              onClick={() => handleDeleteSub(cat.id, sub.id)}
                              style={{ ...smallBtn({ background: 'none', border: '1px solid #ffd5d5', color: '#e53935', padding: '3px 8px' }) }}
                            >삭제</button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      placeholder="새 서브카테고리 이름"
                      value={newSubName[cat.id] ?? ''}
                      onChange={e => setNewSubName(v => ({ ...v, [cat.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddSub(cat.id)}
                      style={{ ...inp, flex: 1 }}
                    />
                    <button
                      onClick={() => handleAddSub(cat.id)}
                      disabled={!(newSubName[cat.id] ?? '').trim()}
                      style={{ ...smallBtn({ background: C.primary, color: '#fff', opacity: !(newSubName[cat.id] ?? '').trim() ? 0.5 : 1 }) }}
                    >+ 추가</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 새 카테고리 추가 */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(83,74,183,0.12)', borderRadius: C.cardRadius, padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#999', letterSpacing: 1, marginBottom: 12 }}>새 카테고리 추가</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <label style={lbl}>이모지</label>
            <input
              value={newEmoji}
              onChange={e => setNewEmoji(e.target.value)}
              placeholder="💼"
              maxLength={2}
              style={{ ...inp, width: 52, textAlign: 'center', fontSize: 18 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>카테고리 이름 *</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="새 카테고리"
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              style={{ ...inp, width: '100%' }}
            />
          </div>
          <button
            onClick={handleAddCategory}
            disabled={adding || !newName.trim()}
            style={{ padding: '9px 20px', borderRadius: C.btnRadius, border: 'none', background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: adding || !newName.trim() ? 'default' : 'pointer', opacity: adding || !newName.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}
          >
            {adding ? '추가 중...' : '+ 추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Admin page
// ─────────────────────────────────────────────
export default function Admin() {
  const { sites, loading, addSite, updateSite, deleteSite, toggleAd } = useDirectory()
  const [adminTab, setAdminTab] = useState('sites')
  const [showAdd, setShowAdd]   = useState(false)
  const [editSite, setEditSite] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (id) => {
    setDeleting(true)
    await deleteSite(id)
    setDeleteId(null)
    setDeleting(false)
  }

  const th = { padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#666', textAlign: 'left', whiteSpace: 'nowrap', background: '#fafafe' }
  const td = { padding: '13px 14px', fontSize: 13, color: '#333', verticalAlign: 'middle' }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* ── 탭 ── */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid #ebe9fc' }}>
          {[
            { key: 'sites',      label: '디렉토리 관리' },
            { key: 'categories', label: '카테고리 관리' },
          ].map(({ key, label }) => {
            const on = adminTab === key
            return (
              <button
                key={key}
                onClick={() => setAdminTab(key)}
                style={{
                  padding: '10px 20px', border: 'none', cursor: 'pointer',
                  background: 'none', fontFamily: 'inherit',
                  fontSize: 14, fontWeight: on ? 700 : 500,
                  color: on ? C.primary : '#888',
                  borderBottom: on ? `2px solid ${C.primary}` : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {adminTab === 'categories' ? (
          <CategoryManager />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.dark, margin: '0 0 4px' }}>디렉토리 관리</h2>
                <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                  총 <strong style={{ color: C.primary }}>{sites.length}</strong>개의 사이트가 등록되어 있습니다.
                </p>
              </div>
              <button onClick={() => setShowAdd(true)}
                style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(83,74,183,0.3)' }}>
                + 사이트 추가
              </button>
            </div>

            <div style={{ background: '#fff', border: '0.5px solid rgba(83,74,183,0.12)', borderRadius: C.cardRadius, overflowX: 'auto' }}>
              {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
              ) : sites.length === 0 ? (
                <div style={{ padding: 64, textAlign: 'center', color: '#aaa' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#666', margin: '0 0 6px' }}>등록된 사이트가 없습니다.</p>
                  <button onClick={() => setShowAdd(true)}
                    style={{ marginTop: 16, background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    + 사이트 추가
                  </button>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0eeff' }}>
                      <th style={th}>아이콘</th>
                      <th style={th}>사이트명</th>
                      <th style={th}>URL</th>
                      <th style={th}>카테고리</th>
                      <th style={th}>한줄 소개</th>
                      <th style={th}>태그</th>
                      <th style={{ ...th, textAlign: 'center' }}>광고유형</th>
                      <th style={{ ...th, textAlign: 'center' }}>광고</th>
                      <th style={th}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.map((site, i) => (
                      <tr key={site.id} style={{ borderBottom: i < sites.length - 1 ? '1px solid #f8f7ff' : 'none' }}>
                        <td style={{ ...td, fontSize: 22, textAlign: 'center', width: 52 }}>{site.icon || '🌐'}</td>
                        <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {site.name}
                          {site.adType === 'premium' && (
                            <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, background: C.primary, color: '#fff', borderRadius: 4, padding: '1px 5px' }}>P</span>
                          )}
                        </td>
                        <td style={td}>
                          <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: C.primary, textDecoration: 'none', fontSize: 12 }}>
                            {site.url.replace(/^https?:\/\//, '').slice(0, 26)}{site.url.replace(/^https?:\/\//, '').length > 26 ? '…' : ''}
                          </a>
                        </td>
                        <td style={td}>
                          <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '2px 9px', background: '#EEEDFE', color: C.primary, whiteSpace: 'nowrap' }}>
                            {site.category}{site.subcategory ? ` / ${site.subcategory}` : ''}
                          </span>
                        </td>
                        <td style={{ ...td, maxWidth: 180, color: '#777' }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {site.shortDesc || site.description || '-'}
                          </span>
                        </td>
                        <td style={{ ...td, color: '#aaa', fontSize: 11, whiteSpace: 'nowrap' }}>
                          {Array.isArray(site.tags) ? site.tags.slice(0, 2).join(' ') : (site.tags || '-')}
                        </td>
                        <td style={{ ...td, textAlign: 'center' }}>
                          <span style={{ fontSize: 11, color: site.adType !== 'none' ? C.primary : '#ccc', fontWeight: 600 }}>
                            {site.adType === 'none' ? '-' : site.adType === 'premium' ? 'PREM' : 'BNR'}
                          </span>
                        </td>
                        <td style={{ ...td, textAlign: 'center' }}>
                          <Toggle on={!!site.isAd} onChange={() => toggleAd(site.id, site.isAd)} />
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button onClick={() => setEditSite(site)}
                              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e0dff8', background: '#fff', color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              수정
                            </button>
                            {deleteId === site.id ? (
                              <>
                                <button onClick={() => handleDelete(site.id)} disabled={deleting}
                                  style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#e53935', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                  {deleting ? '…' : '확인'}
                                </button>
                                <button onClick={() => setDeleteId(null)}
                                  style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', color: '#888', fontSize: 12, cursor: 'pointer' }}>
                                  취소
                                </button>
                              </>
                            ) : (
                              <button onClick={() => setDeleteId(site.id)}
                                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ffd5d5', background: '#fff5f5', color: '#e53935', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                삭제
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {showAdd && (
        <SiteFormModal title="사이트 추가" allSites={sites} onClose={() => setShowAdd(false)} onSave={addSite} />
      )}
      {editSite && (
        <SiteFormModal title="사이트 수정" initial={editSite} allSites={sites} onClose={() => setEditSite(null)} onSave={(form) => updateSite(editSite.id, form)} />
      )}
    </div>
  )
}
