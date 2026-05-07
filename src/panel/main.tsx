import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Detail from './pages/Detail.tsx'
import Answer from './pages/Answer.tsx'
import { getVscodeApi } from '../view/utils/vscodeApi'
import "@/styles.css";
const vscode = getVscodeApi()

const THEME_KIND_CLASS_MAP: Record<string, string> = {
  'vscode-theme-light': 'vscode-light',
  'vscode-theme-dark': 'vscode-dark',
  'vscode-theme-high-contrast': 'vscode-high-contrast',
  'vscode-theme-high-contrast-light': 'vscode-high-contrast-light',
};

function syncThemeClass() {
  const kind = document.body.getAttribute('data-vscode-theme-kind') || '';
  const targetClass = THEME_KIND_CLASS_MAP[kind];
  if (!targetClass) return;

  const allThemeClasses = Object.values(THEME_KIND_CLASS_MAP);
  allThemeClasses.forEach(cls => document.body.classList.remove(cls));
  document.body.classList.add(targetClass);
}

function useThemeSync() {
  useEffect(() => {
    syncThemeClass();

    const observer = new MutationObserver(syncThemeClass);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-vscode-theme-kind'],
    });

    return () => observer.disconnect();
  }, []);
}

function App() {
  const navigate = useNavigate()
  const [isInitialized, setIsInitialized] = useState(false)

  useThemeSync()

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
            setIsInitialized(true)
            navigate(message.postData.router)
          }

          if (message.command === 'themeChanged') {
            const themeKind = message.data?.themeKind;
            if (themeKind) {
              document.body.setAttribute('data-vscode-theme-kind', themeKind);
            }
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