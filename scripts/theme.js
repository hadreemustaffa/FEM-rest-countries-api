import { THEME_KEY } from './constants.js';
import { moonIcon, sunIcon } from './icons.js';

const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  let currentTheme = localStorage.getItem(THEME_KEY) || 'light';

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    if (theme === 'dark') {
      themeToggle.innerHTML = sunIcon;
      themeToggle.setAttribute('aria-label', 'Toggle Light Mode');
    } else {
      themeToggle.innerHTML = moonIcon;
      themeToggle.setAttribute('aria-label', 'Toggle Dark Mode');
    }
  };

  // initial load
  applyTheme(currentTheme);

  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
  });
}
