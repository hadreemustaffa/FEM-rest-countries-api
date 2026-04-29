import { COUNTRIES_DATA_KEY } from './scripts/constants.js';
import {
  shuffle,
  debounce,
  createErrorElement,
  clearErrorElement,
  getAllDataFromSessionStorage,
} from './scripts/helpers.js';

function createCountriesList(country) {
  const countryCard = document.createElement('li');
  countryCard.classList.add('card');

  const countryLink = document.createElement('a');
  countryLink.href = `country/?name=${encodeURIComponent(country.name.common)}&code=${country.cca3}`;

  const flagDiv = document.createElement('div');
  flagDiv.classList.add('card__flag');

  const flagImg = document.createElement('img');
  flagImg.classList.add('card__flag-img');
  flagImg.src = country.flags.svg;
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
  capitalParagraph.textContent = `Capital: ${country.capital && country.capital.length > 0 ? country.capital[0] : 'N/A'}`;

  detailsDiv.appendChild(nameHeading);
  detailsDiv.appendChild(populationParagraph);
  detailsDiv.appendChild(regionParagraph);
  detailsDiv.appendChild(capitalParagraph);

  countryLink.appendChild(flagDiv);
  countryLink.appendChild(detailsDiv);

  countryCard.appendChild(countryLink);

  const cardsContainer = document.querySelector('.cards');
  if (!cardsContainer) return;
  document.querySelector('.cards').appendChild(countryCard);
}

function render() {
  const cachedCountries = getAllDataFromSessionStorage();

  const cardsContainer = document.querySelector('.cards');
  if (cardsContainer) {
    clearErrorElement();
    cardsContainer.replaceChildren();

    const filtered = cachedCountries.filter((country) => {
      const matchesSearch = country.name.common
        .toLowerCase()
        .includes(currentFilters.search.toLowerCase());
      const matchesRegion =
        !currentFilters.region || country.region === currentFilters.region;
      return matchesSearch && matchesRegion;
    });

    filtered.forEach((country) => createCountriesList(country));
  } else {
    console.error('Cards container not found in HTML.');
    return createErrorElement('Unable to shuffle countries.');
  }
}

function shuffleCountries() {
  const cachedCountries = getAllDataFromSessionStorage();
  const shuffledCountries = shuffle(cachedCountries);
  sessionStorage.setItem(COUNTRIES_DATA_KEY, JSON.stringify(shuffledCountries));
  render();
}

const shuffleButton = document.getElementById('shuffle');
if (shuffleButton) {
  const shuffleIcon = shuffleButton.querySelector('svg');
  shuffleButton.addEventListener('click', () => {
    shuffleIcon.classList.add('shuffling');
    shuffleCountries();
  });
  shuffleIcon.addEventListener('animationend', () => {
    shuffleIcon.classList.remove('shuffling');
  });
}

const currentFilters = {
  search: '',
  region: '',
};

const handleSearch = debounce((event) => {
  currentFilters.search = event.target.value.trim();
  render();
}, 300);

const searchInput = document.getElementById('search');
if (searchInput) {
  searchInput.addEventListener('input', handleSearch);
}

const filterSelect = document.getElementById('region-select');
if (filterSelect) {
  filterSelect.addEventListener('change', (event) => {
    currentFilters.region = event.target.value;
    render();
  });
}

async function getCountries() {
  const cachedCountries = getAllDataFromSessionStorage();

  if (cachedCountries) {
    render();
    return;
  }

  try {
    const response = await fetch(
      'https://restcountries.com/v3.1/all?fields=cca3,flags,name,population,region,capital'
    );
    if (!response.ok) {
      throw new Error('API returned an error status');
    }
    clearErrorElement();
    const data = await response.json();
    const shuffledData = shuffle(data);
    // so that each refresh doesn't change the order of countries until shuffle button is clicked
    sessionStorage.setItem(COUNTRIES_DATA_KEY, JSON.stringify(shuffledData));
    shuffledData.forEach((country) => {
      createCountriesList(country);
    });
  } catch (error) {
    console.error('Error:', error);
    createErrorElement('Something went wrong. Please try again later.');
  }
}

document.addEventListener('DOMContentLoaded', getCountries);
