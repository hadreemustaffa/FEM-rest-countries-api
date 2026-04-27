import { THEME_KEY } from './constants.js';
import { moonIcon, sunIcon } from './icons.js';

const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? sunIcon : moonIcon;
  }

  themeToggle.addEventListener('click', () => {
    const isDarkTheme =
      document.documentElement.getAttribute('data-theme') === 'dark';

    localStorage.setItem(THEME_KEY, isDarkTheme ? 'light' : 'dark');
    themeToggle.innerHTML = isDarkTheme ? moonIcon : sunIcon;
    document.documentElement.setAttribute(
      'data-theme',
      isDarkTheme ? 'light' : 'dark'
    );
  });
}
