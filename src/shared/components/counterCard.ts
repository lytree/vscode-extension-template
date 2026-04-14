import { createCounter } from '../hooks/createCounter';

export function mountCounterCard(container: HTMLElement, title: string) {
  const counter = createCounter();

  container.innerHTML = `
    <section class="card">
      <h1>${title}</h1>
      <button id="incBtn">+1</button>
      <p id="countText">count: 0</p>
    </section>
  `;

  const button = container.querySelector<HTMLButtonElement>('#incBtn');
  const text = container.querySelector<HTMLElement>('#countText');

  button?.addEventListener('click', () => {
    const next = counter.increment();
    if (text) {
      text.textContent = `count: ${next}`;
    }
  });
}
