import { useLayoutType } from '../hooks/useLayoutType'
import { useSites } from '../hooks/useSites'
import { useCollections } from '../hooks/useCollections'
import LayoutA from '../components/layouts/LayoutA'
import LayoutB from '../components/layouts/LayoutB'
import LayoutC from '../components/layouts/LayoutC'

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f4ff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ fontSize: 14, color: '#aaa' }}>불러오는 중...</div>
    </div>
  )
}

export default function Dashboard() {
  const { layoutType, setLayoutType, loading: layoutLoading } = useLayoutType()
  const siteData = useSites()
  const { createCollection } = useCollections()

  if (layoutLoading) return <LoadingScreen />

  const props = { ...siteData, layoutType, setLayoutType, createCollection }

  if (layoutType === 'B') return <LayoutB {...props} />
  if (layoutType === 'C') return <LayoutC {...props} />
  return <LayoutA {...props} />
}
