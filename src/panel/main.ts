import '@/style.css';
import { mountPanelPage } from './page';

const root = document.getElementById('app');
if (root) {
  mountPanelPage(root);
}
