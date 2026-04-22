import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Detail from './pages/Detail.tsx'
import Answer from './pages/Answer.tsx'
import { getVscodeApi } from '../view/utils/vscodeApi'
import "@/styles.css";
const vscode = getVscodeApi()

function App() {
  const navigate = useNavigate()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 处理初始化逻辑
    const initializeApp = async () => {
      try {


        // 向扩展发送 Panel 准备就绪的消息
        vscode.postMessage({ command: 'panelReady' })

        // 监听来自扩展的消息
        const handleMessage = (event: MessageEvent) => {
          const message = event.data


          if (message.command === 'routerInit') {
            // 初始化完成，跳转到详情页
            setIsInitialized(true)
            navigate(message.postData.router)
            // 处理初始化参数
  
          }
        }

        window.addEventListener('message', handleMessage)

        return () => {
          window.removeEventListener('message', handleMessage)
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      }
    }

    initializeApp()
  }, [navigate])

  // 显示加载状态
  if (!isInitialized) {
    return (
      <div className="h-full bg-card p-4 flex items-center justify-center">
        <div className="text-foreground">初始化中...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/detail" element={<Detail />} />
      <Route path="/answer" element={<Answer />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)