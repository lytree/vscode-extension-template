export function mountTemplateApp(root, mode) {
  root.innerHTML = `
    <main class="container">
      <h1>共享组件页面</h1>
      <p>当前入口：<strong>${mode}</strong></p>
      <p>WebviewPanel 与 WebviewViewProvider 使用同一套组件，仅入口不同。</p>
      <button id="pingBtn">Ping</button>
      <pre id="output">ready</pre>
    </main>
  `;

  const output = root.querySelector('#output');
  const button = root.querySelector('#pingBtn');
  button?.addEventListener('click', () => {
    output.textContent = `[${mode}] ${new Date().toLocaleTimeString()}`;
  });
}
