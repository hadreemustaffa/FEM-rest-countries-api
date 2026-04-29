import {
  COUNTRIES_DATA_KEY,
  DETAILED_COUNTRIES_DATA_KEY,
} from './constants.js';

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function debounce(fn, delay = 300) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function createErrorElement(
  message,
  container = document.querySelector('main')
) {
  if (!container) return;

  let errorElement = container.querySelector('.status--error');

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'status status--error';
    errorElement.setAttribute('role', 'alert');
    container.appendChild(errorElement);
  }

  errorElement.textContent = message;
}

export function clearErrorElement(container = document.querySelector('main')) {
  if (!container) return;

  const errorElement = container.querySelector('.status--error');
  errorElement?.remove();
}

export function getAllDataFromSessionStorage() {
  const data = sessionStorage.getItem(COUNTRIES_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function getDataFromSessionStorage(countryName) {
  const data =
    JSON.parse(sessionStorage.getItem(DETAILED_COUNTRIES_DATA_KEY)) || {};

  return data[countryName.toLowerCase()] || null;
}
