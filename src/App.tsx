import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <main className="page-center">
      <section className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg shadow-black/30">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
          <Sparkles className="size-3.5" />
          Starter Template
        </p>
        <h1 className="m-0 text-3xl font-bold leading-tight">Vite + React + TS + UnoCSS + shadcn/ui</h1>
        <p className="mb-8 mt-3 text-slate-300">
          开箱即用：路径别名、UnoCSS 原子类、以及 shadcn 风格组件（Button）。
        </p>
        <div className="flex flex-wrap gap-3">
          <Button>Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </section>
    </main>
  );
}

export default App;
