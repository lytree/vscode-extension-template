import { mountCounterCard } from '../shared/components/counterCard';

export function mountViewPage(root: HTMLElement) {
  root.innerHTML = '<div class="layout"><div id="viewCard"></div><p>View 页面（独立入口）。</p></div>';
  const target = root.querySelector<HTMLElement>('#viewCard');
  if (target) {
    mountCounterCard(target, 'View Counter');
  }
}
