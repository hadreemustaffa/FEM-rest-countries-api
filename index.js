// constants
const CACHE_KEY = 'countries-data';

// helpers
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showStatus(message, type = 'error') {
  const status = document.getElementById('status');
  if (!status) return;
  status.textContent = message;
  status.className = `status status--${type}`;
}

function createCountriesList(country) {
  const countryCard = document.createElement('li');
  countryCard.classList.add('card');

  const countryLink = document.createElement('a');
  countryLink.href = `${country.name.common.toLowerCase().replace(/\s/g, '-')}`;

  const flagDiv = document.createElement('div');
  flagDiv.classList.add('card__flag');

  const flagImg = document.createElement('img');
  flagImg.classList.add('card__flag-img');
  flagImg.src = country.flags.png;
  flagImg.alt = `${country.name.common} flag`;

  flagDiv.appendChild(flagImg);

  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('card__details');

  const nameHeading = document.createElement('h2');
  nameHeading.classList.add('card__details-title');
  nameHeading.textContent = country.name.common;

  const populationParagraph = document.createElement('p');
  populationParagraph.classList.add('card__details-population');
  populationParagraph.textContent = `Population: ${country.population.toLocaleString()}`;

  const regionParagraph = document.createElement('p');
  regionParagraph.classList.add('card__details-region');
  regionParagraph.textContent = `Region: ${country.region}`;

  const capitalParagraph = document.createElement('p');
  capitalParagraph.classList.add('card__details-capital');
  capitalParagraph.textContent = `Capital: ${country.capital ? country.capital[0] : 'N/A'}`;

  detailsDiv.appendChild(nameHeading);
  detailsDiv.appendChild(populationParagraph);
  detailsDiv.appendChild(regionParagraph);
  detailsDiv.appendChild(capitalParagraph);

  countryLink.appendChild(flagDiv);
  countryLink.appendChild(detailsDiv);

  countryCard.appendChild(countryLink);

  document.querySelector('.cards').appendChild(countryCard);
}

function shuffleCountries(data) {
  const shuffledCountries = shuffle(data);
  shuffledCountries.forEach((country) => {
    createCountriesList(country);
  });
}

function renderShuffledCountries() {
  const cardsContainer = document.querySelector('.cards');
  // clear all children before rendering shuffled list
  cardsContainer.innerHTML = '';
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    const data = JSON.parse(cached);
    shuffleCountries(data);
  }
}

const shuffleButton = document.getElementById('shuffle');
shuffleButton.addEventListener('click', () => {
  renderShuffledCountries();
});

function getCountries() {
  const cached = sessionStorage.getItem(CACHE_KEY);

  if (cached) {
    const data = JSON.parse(cached);
    shuffleCountries(data);
    return Promise.resolve(data);
  }

  fetch(
    'https://restcountries.com/v3.1/all?fields=flags,name,population,region,capital'
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('API returned an error status');
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      shuffleCountries(data);
    })
    .catch((error) => {
      console.error('Error:', error);
      showStatus('Something went wrong. Please try again later.');
    });
}

document.addEventListener('DOMContentLoaded', getCountries);
