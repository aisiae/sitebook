import { useNavigate } from 'react-router-dom'
import Navbar from '../common/Navbar'
import { useLayoutType } from '../../hooks/useLayoutType'

const C = {
  primary:      '#534AB7',
  primaryLight: '#EEEDFE',
  bg:           '#f5f4ff',
  dark:         '#2d2a6e',
  cardBorder:   '0.5px solid rgba(83,74,183,0.12)',
}

// ─────────────────────────────────────────────
// 레이아웃 미리보기 썸네일
// ─────────────────────────────────────────────
function PreviewA() {
  return (
    <div style={{ background: '#f8f7ff', borderRadius: 8, padding: '10px 10px 8px', height: 120, overflow: 'hidden' }}>
      {/* 탭 + 버튼 행 */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 7 }}>
        {[28, 22, 22, 22].map((w, i) => (
          <div key={i} style={{ height: 9, width: w, borderRadius: 999, background: i === 0 ? C.primary : '#ddd' }} />
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ height: 9, width: 36, borderRadius: 4, background: '#e0dff8' }} />
        <div style={{ height: 9, width: 18, borderRadius: 4, background: C.primary }} />
      </div>
      {/* 통계 카드 3개 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 18, borderRadius: 5, background: '#fff', border: '0.5px solid #e0dff8', display: 'flex', alignItems: 'center', gap: 3, padding: '0 5px' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: C.primaryLight, flexShrink: 0 }} />
            <div style={{ height: 4, flex: 1, borderRadius: 2, background: '#eee' }} />
          </div>
        ))}
      </div>
      {/* 카드 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {Array(8).fill(0).map((_, i) => (
          <div key={i} style={{ height: 30, borderRadius: 5, background: '#fff', border: '0.5px solid #e0dff8', display: 'flex', flexDirection: 'column', gap: 3, padding: '5px 5px' }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: C.primaryLight, flexShrink: 0 }} />
              <div style={{ height: 4, flex: 1, borderRadius: 2, background: '#eee' }} />
            </div>
            <div style={{ height: 3, width: '60%', borderRadius: 2, background: '#f0f0f0' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewB() {
  return (
    <div style={{ background: '#f8f7ff', borderRadius: 8, height: 120, overflow: 'hidden', display: 'flex' }}>
      {/* 사이드바 */}
      <div style={{ width: 46, background: '#fff', borderRight: '0.5px solid #e8e6f8', padding: '8px 5px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {['💼', '💻', '🛍', '💳', '📱', '🤖'].map((e, i) => (
          <div key={e} style={{
            height: 12, borderRadius: 4, padding: '0 4px',
            background: i === 0 ? C.primaryLight : 'transparent',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 7, lineHeight: 1 }}>{e}</span>
            {i === 0 && <div style={{ height: 3, flex: 1, borderRadius: 1, background: C.primary, opacity: 0.5 }} />}
          </div>
        ))}
      </div>
      {/* 리스트 영역 */}
      <div style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 컬럼 헤더 */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 1, paddingBottom: 3, borderBottom: '0.5px solid #e8e6f8' }}>
          {[36, 28, 22, 18].map((w, i) => (
            <div key={i} style={{ height: 5, width: w, borderRadius: 2, background: '#ccc' }} />
          ))}
        </div>
        {/* 리스트 행 */}
        {Array(5).fill(0).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 3, alignItems: 'center', height: 14, background: '#fff', borderRadius: 4, padding: '0 5px' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: '#e8e6f8', flexShrink: 0 }} />
            <div style={{ height: 4, flex: 2, borderRadius: 2, background: '#eee' }} />
            <div style={{ height: 4, flex: 1, borderRadius: 2, background: '#f0f0f0' }} />
            <div style={{ height: 4, width: 14, borderRadius: 2, background: '#f5f4ff' }} />
            <div style={{ height: 6, width: 14, borderRadius: 3, background: '#EAF3DE', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewC() {
  return (
    <div style={{ background: '#f8f7ff', borderRadius: 8, height: 120, overflow: 'hidden', display: 'flex' }}>
      {/* 사이드바 */}
      <div style={{ width: 46, background: '#fff', borderRight: '0.5px solid #e8e6f8', padding: '8px 5px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {['💼', '💻', '🛍', '💳', '📱', '🤖'].map((e, i) => (
          <div key={e} style={{
            height: 12, borderRadius: 4, padding: '0 4px',
            background: i === 0 ? C.primaryLight : 'transparent',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 7, lineHeight: 1 }}>{e}</span>
            {i === 0 && <div style={{ height: 3, flex: 1, borderRadius: 1, background: C.primary, opacity: 0.5 }} />}
          </div>
        ))}
      </div>
      {/* 폴더 뷰 */}
      <div style={{ flex: 1, padding: '7px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { color: C.primaryLight, barColor: C.primary },
          { color: '#f0f0f0', barColor: '#bbb' },
        ].map((s, si) => (
          <div key={si}>
            {/* 섹션 헤더 */}
            <div style={{ height: 10, background: s.color, borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', padding: '0 5px', gap: 3, marginBottom: 3 }}>
              <div style={{ height: 4, width: 28, borderRadius: 2, background: s.barColor, opacity: 0.6 }} />
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 7, color: '#aaa', lineHeight: 1 }}>▾</div>
            </div>
            {/* 미니 카드 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
              {Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ height: 20, borderRadius: 3, background: '#fff', border: '0.5px solid #e0dff8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 1, background: '#e8e6f8' }} />
                  <div style={{ height: 2, width: '60%', borderRadius: 1, background: '#eee' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 레이아웃 정의
// ─────────────────────────────────────────────
const LAYOUTS = [
  {
    type:    'A',
    name:    '미니멀 카드 그리드',
    desc:    '사이트 수가 적거나 시각적으로 한눈에 보고 싶을 때',
    Preview: PreviewA,
  },
  {
    type:    'B',
    name:    '사이드바 + 리스트',
    desc:    '사이트가 많아서 빠르게 찾고 스캔하고 싶을 때',
    Preview: PreviewB,
  },
  {
    type:    'C',
    name:    '카테고리 폴더',
    desc:    '카테고리별로 접고 펼치며 관리하는 헤비유저',
    Preview: PreviewC,
  },
]

// ─────────────────────────────────────────────
// LayoutSelector page
// ─────────────────────────────────────────────
export default function LayoutSelector() {
  const navigate = useNavigate()
  const { layoutType, setLayoutType, loading } = useLayoutType()

  const handleSelect = async (type) => {
    await setLayoutType(type)
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, padding: '0 0 24px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← 대시보드로
        </button>

        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>LAYOUT</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.dark, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            대시보드 레이아웃 선택
          </h1>
          <p style={{ fontSize: 15, color: '#888', margin: 0 }}>
            원하는 스타일을 선택하세요. 언제든지 변경할 수 있어요.
          </p>
        </div>

        {/* 카드 3개 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {LAYOUTS.map(({ type, name, desc, Preview }, idx) => {
            const selected = layoutType === type
            return (
              <div
                key={type}
                style={{
                  background: '#fff',
                  border: selected ? `2px solid ${C.primary}` : C.cardBorder,
                  borderRadius: 16,
                  padding: '22px 20px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  boxShadow: selected
                    ? '0 4px 24px rgba(83,74,183,0.15)'
                    : '0 1px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {/* 번호 뱃지 */}
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 24, height: 24, borderRadius: '50%',
                  background: selected ? C.primary : '#f0eff8',
                  color: selected ? '#fff' : '#bbb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {idx + 1}
                </div>

                {/* 이름 + 설명 */}
                <div style={{ paddingRight: 28 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 5 }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', lineHeight: 1.55 }}>{desc}</div>
                </div>

                {/* 미리보기 */}
                <Preview />

                {/* 선택 버튼 */}
                {selected ? (
                  <div style={{
                    textAlign: 'center', padding: '10px',
                    background: C.primaryLight, borderRadius: 8,
                    fontSize: 13, fontWeight: 700, color: C.primary,
                  }}>
                    ✓ 현재 사용 중
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelect(type)}
                    style={{
                      padding: '10px', borderRadius: 8,
                      border: `1px solid ${C.primary}`,
                      background: '#fff', color: C.primary,
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.primary }}
                  >
                    이 레이아웃 선택
                  </button>
                )}
              </div>
            )
          })}
        </div>

      </main>
    </div>
  )
}
