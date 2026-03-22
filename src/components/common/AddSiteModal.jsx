import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { STATUS_LABEL } from '../../lib/constants'
import { useTheme } from '../../store/themeContext'

export default function AddSiteModal({ onClose, onSave, initial = null }) {
  const isEdit = !!initial
  const { categories } = useCategories()
  const C = useTheme()

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: C.inputBorder, borderRadius: 8, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    background: C.inputBg, color: C.textPrimary,
  }
  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: C.textSub, marginBottom: 6, display: 'block',
  }

  const [form, setForm] = useState({
    name:        initial?.name        ?? '',
    url:         initial?.url         ?? '',
    category:    initial?.category    ?? '',
    subcategory: initial?.subcategory ?? '',
    loginId:     initial?.loginId     ?? '',
    memo:        initial?.memo        ?? '',
    status:      initial?.status      ?? 'active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleCategoryChange = (e) => {
    setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))
  }

  const selectedCatObj = categories.find(c => c.name === form.category)
  const subcats = selectedCatObj?.subcategories ?? []

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

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: C.cardBg, borderRadius: 16, padding: '32px 28px',
        width: '100%', maxWidth: 460,
        boxShadow: C.isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(83,74,183,0.18)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        border: C.cardBorder,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>
            {isEdit ? '사이트 수정' : '사이트 추가'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.textMuted, lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>사이트명 *</label>
            <input style={inputStyle} placeholder="예: GitHub" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label style={labelStyle}>URL *</label>
            <input style={inputStyle} placeholder="예: https://github.com" value={form.url} onChange={set('url')} />
          </div>
          <div>
            <label style={labelStyle}>카테고리 *</label>
            <select style={{ ...inputStyle, color: form.category ? C.textPrimary : C.textMuted }} value={form.category} onChange={handleCategoryChange}>
              <option value="" disabled>카테고리 선택</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>

          {/* 서브카테고리: 선택한 카테고리에 서브카테고리가 있을 때만 표시 */}
          {subcats.length > 0 && (
            <div>
              <label style={labelStyle}>서브카테고리 (선택)</label>
              <select style={{ ...inputStyle, color: form.subcategory ? C.textPrimary : C.textMuted }} value={form.subcategory} onChange={set('subcategory')}>
                <option value="">서브카테고리 선택</option>
                {subcats.map(sub => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 수정 모드에서만 상태 변경 */}
          {isEdit && (
            <div>
              <label style={labelStyle}>상태</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['active', 'dormant'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 8,
                      border: `1px solid ${form.status === s ? C.primary : C.subBorder}`,
                      background: form.status === s ? C.primary : C.cardBg,
                      color: form.status === s ? '#fff' : C.textSub,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>아이디 (선택)</label>
            <input style={inputStyle} placeholder="해당 사이트 로그인 아이디" value={form.loginId} onChange={set('loginId')} />
          </div>
          <div>
            <label style={labelStyle}>메모 (선택)</label>
            <input style={inputStyle} placeholder="간단한 메모" value={form.memo} onChange={set('memo')} />
          </div>

          {error && <p style={{ fontSize: 12, color: '#e53935', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: C.btnRadius, border: C.inputBorder, background: C.cardBg, color: C.textSub, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              type="submit" disabled={saving}
              style={{ flex: 2, padding: '11px', borderRadius: C.btnRadius, border: 'none', background: C.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? '저장 중...' : (isEdit ? '수정하기' : '추가하기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
