const vscode = acquireVsCodeApi();
const input = document.getElementById('nameInput');
const button = document.getElementById('helloBtn');
const result = document.getElementById('result');

button?.addEventListener('click', () => {
  vscode.postMessage({
    type: 'sayHello',
    payload: input?.value ?? ''
  });
});

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.type === 'helloResult') {
    result.textContent = String(message.payload ?? '');
  }
});
