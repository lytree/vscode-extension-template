import { Button } from '../components/ui/button';

export function mountPanelPage(root: HTMLElement) {
  root.innerHTML = '<div class="layout"><div id="panelCard"></div><p>Panel 页面（独立入口）。</p></div>';
  const target = root.querySelector<HTMLElement>('#panelCard');
  if (target) {
    Button(target, 'Panel Counter');
  }
}
