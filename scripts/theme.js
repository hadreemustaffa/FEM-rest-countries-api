import { THEME_KEY } from './constants.js';

const countryPage = window.location.pathname.includes('/country/');
const isInCountryPage = countryPage ? '../' : './';
const moonIconSrc = `${isInCountryPage}icons/moon.png`;
const sunIconSrc = `${isInCountryPage}icons/sun.png`;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-toggle__icon');

if (themeToggle) {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.src = savedTheme === 'dark' ? sunIconSrc : moonIconSrc;
  }

  themeToggle.addEventListener('click', () => {
    const isDarkTheme =
      document.documentElement.getAttribute('data-theme') === 'dark';

    localStorage.setItem(THEME_KEY, isDarkTheme ? 'light' : 'dark');
    themeIcon.src = isDarkTheme ? moonIconSrc : sunIconSrc;
    themeIcon.style.transform = 'rotate(360deg)';
    document.documentElement.setAttribute(
      'data-theme',
      isDarkTheme ? 'light' : 'dark'
    );
  });

  themeIcon.addEventListener('transitionend', () => {
    themeIcon.removeAttribute('style');
  });
}
