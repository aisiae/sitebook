import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg w-full">
        <h1 className="text-5xl font-extrabold text-indigo-600 mb-4">SiteBook</h1>
        <p className="text-xl text-gray-600 mb-2">내가 가입한 웹사이트를 한 곳에서 관리하세요.</p>
        <p className="text-gray-400 mb-10">카테고리별 정리 · 마지막 접속일 기록 · 유용한 사이트 큐레이션</p>

        <div className="flex justify-center">
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow w-64 justify-center"
          >
            <GoogleIcon />
            Google로 시작하기
          </button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: '📌', title: '사이트 등록', desc: '가입한 사이트를 카테고리별로 정리' },
            { icon: '⏱️', title: '접속일 관리', desc: '마지막 방문일을 자동으로 기록' },
            { icon: '🔍', title: '사이트 큐레이션', desc: '엄선된 유용한 사이트 디렉토리' },
          ].map((f) => (
            <div key={f.title} className="p-4 bg-white rounded-xl shadow-sm">
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-semibold text-gray-700 text-sm">{f.title}</div>
              <div className="text-xs text-gray-400 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.01 17.64 11.702 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}
