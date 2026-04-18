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

function slugify(text) {
  return text
    .toString()
    .normalize('NFD') // Separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // Remove the separated accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars (except -)
    .replace(/--+/g, '-'); // Replace multiple - with single -
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
  countryLink.href = `${slugify(country.name.common)}`;

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
  // overwrite the cache with the new shuffled order so that it persists until next shuffle or page refresh
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(shuffledCountries));
  shuffledCountries.forEach((country) => {
    createCountriesList(country);
  });
}

function renderShuffledCountries() {
  const cardsContainer = document.querySelector('.cards');
  // clear all children before rendering shuffled list
  cardsContainer.replaceChildren();
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    const data = JSON.parse(cached);
    shuffleCountries(data);
  }
}

const shuffleButton = document.getElementById('shuffle');
if (shuffleButton) {
  shuffleButton.addEventListener('click', () => {
    renderShuffledCountries();
  });
}

async function getCountries() {
  const cached = sessionStorage.getItem(CACHE_KEY);

  if (cached) {
    const data = JSON.parse(cached);
    data.forEach((country) => {
      createCountriesList(country);
    });
    return Promise.resolve(data);
  }

  try {
    const response = await fetch(
      'https://restcountries.com/v3.1/all?fields=flags,name,population,region,capital'
    );
    if (!response.ok) {
      throw new Error('API returned an error status');
    }
    const data = await response.json();
    const shuffledData = shuffle(data);
    // so that each refresh doesn't change the order of countries until shuffle button is clicked
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(shuffledData));
    shuffleCountries(shuffledData);
    return shuffledData;
  } catch (error) {
    console.error('Error:', error);
    showStatus('Something went wrong. Please try again later.');
  }
}

document.addEventListener('DOMContentLoaded', getCountries);
