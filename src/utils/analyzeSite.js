import Anthropic from '@anthropic-ai/sdk'

const LOADING_MESSAGES = [
  '🔍 사이트 정보 수집 중...',
  '✨ Claude가 내용을 작성하고 있어요...',
  '📝 마무리 중...',
]

export function getLoadingMessage(elapsed) {
  if (elapsed < 1500) return LOADING_MESSAGES[0]
  if (elapsed < 3000) return LOADING_MESSAGES[1]
  return LOADING_MESSAGES[2]
}

export async function analyzeSite(url) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  console.log('API Key exists:', !!apiKey)
  console.log('API Key prefix:', apiKey?.substring(0, 15))

  const client = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  })

  const prompt = `다음 웹사이트 URL을 분석해서 아래 JSON 형식으로만 응답해줘.
다른 말은 하지 말고 JSON만 반환해줘.
마크다운 코드블록도 쓰지 마.

사이트 URL: ${url}

{
  "name": "사이트명",
  "category": "업무|개발|AI|쇼핑|금융|SNS|엔터테인먼트|교육|기타 중 하나",
  "subCategory": "세부 카테고리",
  "shortDesc": "한 줄 소개 (50자 이내)",
  "fullDesc": "상세 소개 (200자 내외)",
  "howToUse": "이용 방법 (단계별, 줄바꿈 구분)",
  "promotionText": "홍보 문구 (100자 내외)",
  "tags": ["태그1", "태그2", "태그3"],
  "isPaid": false,
  "hasFreeplan": false
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
