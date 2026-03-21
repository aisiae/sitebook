const LOADING_MESSAGES = [
  '🔍 사이트 정보 수집 중...',
  '✨ AI가 내용을 작성하고 있어요...',
  '📝 마무리 중...',
]

export function getLoadingMessage(elapsed) {
  if (elapsed < 1500) return LOADING_MESSAGES[0]
  if (elapsed < 3000) return LOADING_MESSAGES[1]
  return LOADING_MESSAGES[2]
}

export async function analyzeSite(url) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('API_KEY_MISSING')

  const prompt = `다음 사이트를 분석해서 아래 JSON 형식으로만 응답해줘.
다른 말은 하지 말고 JSON만 반환해줘.

사이트 URL: ${url}

{
  "name": "사이트명",
  "category": "업무|개발|AI|쇼핑|금융|SNS|엔터테인먼트|교육|기타 중 하나",
  "subCategory": "세부 카테고리",
  "shortDesc": "한 줄 소개 (50자 이내)",
  "fullDesc": "상세 소개 (200자 내외, 주요 기능과 특징 설명)",
  "howToUse": "이용 방법 (단계별로 설명, 각 단계 줄바꿈으로 구분)",
  "promotionText": "홍보 문구 (100자 내외, 사용자가 쓰고 싶게 만드는 매력적인 문구)",
  "tags": ["태그1", "태그2", "태그3"],
  "isPaid": true,
  "hasFreeplan": true
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: '당신은 웹사이트 분석 전문가입니다. 사이트 URL을 받으면 해당 사이트에 대해 한국어로 상세하게 분석해주세요.',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`API_ERROR_${res.status}`)

  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ''

  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/)
  if (!jsonMatch) throw new Error('PARSE_ERROR')

  const parsed = JSON.parse(jsonMatch[1])
  return parsed
}
