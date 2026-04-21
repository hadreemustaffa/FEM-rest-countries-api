export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function showStatus(message, type = 'error') {
  const status = document.getElementById('status');
  if (!status) return;
  status.textContent = message;
  status.className = `status status--${type}`;
}

export function createErrorElement(message) {
  const main = document.querySelector('main');
  const errorElement = document.createElement('div');
  errorElement.ariaLive = 'polite';
  errorElement.classList.add('status', 'status--error');
  errorElement.textContent = message;
  main.appendChild(errorElement);
}

export function clearErrorElement() {
  const main = document.querySelector('main');
  const errorElement = main.querySelector('.status--error');
  if (errorElement) {
    main.removeChild(errorElement);
  }
}
