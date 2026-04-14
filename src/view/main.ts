import '@/style.css';
import { mountViewPage } from './page';

const root = document.getElementById('app');
if (root) {
  mountViewPage(root);
}
