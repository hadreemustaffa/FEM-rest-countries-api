import {
  COUNTRIES_DATA_KEY,
  DETAILED_COUNTRIES_DATA_KEY,
} from '../scripts/constants.js';
import {
  createErrorElement,
  clearErrorElement,
  getAllDataFromSessionStorage,
  getDataFromSessionStorage,
  hideLoader,
} from '../scripts/helpers.js';

async function getBorderCountryNamesWithCode(borderCodes = []) {
  if (!borderCodes.length) return [];

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/alpha?codes=${borderCodes.join(',')}&fields=cca3,name`
    );

    if (!response.ok) {
      throw new Error('Border API error');
    }

    const data = await response.json();

    return data.map((c) => c);
  } catch (error) {
    console.error(error);
    return borderCodes; // fallback
  }
}

function storeDataInSessionStorage(country) {
  const data =
    JSON.parse(sessionStorage.getItem(DETAILED_COUNTRIES_DATA_KEY)) || {};

  const key = country.name.common.toLowerCase();

  data[key] = {
    ...data[key],
    ...country,
  };

  sessionStorage.setItem(DETAILED_COUNTRIES_DATA_KEY, JSON.stringify(data));
}

// this handle the case where some data returns more than one countries
// e.g user navigate to a country for the first time where url is:
// currently known data that returns more than one:
// /country/?name=ireland
// /country/?name=congo or /country/?name=republic of the congo
function suggestNextCountriesInDataList(data) {
  if (data.length > 1) {
    const detailsContainer = document.querySelector('.details');
    if (!detailsContainer) {
      console.error('Details container not found in HTML.');
      return;
    }
    const suggestions = document.createElement('p');
    suggestions.classList.add('suggestions');
    suggestions.textContent = 'Did you mean: ';
    data.map((country, idx) => {
      const listItemLink = document.createElement('a');
      listItemLink.classList.add('suggestions__country');
      listItemLink.href = `country/?name=${encodeURIComponent(country.name.common)}&code=${country.cca3}`;
      listItemLink.textContent = country.name.common;

      if (idx === data.length - 1) {
        suggestions.append(listItemLink, '?');
      } else {
        suggestions.append(listItemLink, ', ');
      }

      detailsContainer.before(suggestions);
    });
  }
}

async function createCountryDetailsElement(country) {
  const detailsContainer = document.querySelector('.details');
  if (!detailsContainer) {
    console.error('Details container not found in HTML.');
    return;
  }

  // clear any existing children to avoid duplicates on re-renders
  detailsContainer.innerHTML = '';

  const flagContainer = document.createElement('div');
  flagContainer.classList.add('details__flag');

  const flagImg = document.createElement('img');
  flagImg.classList.add('details__flag-img');
  flagImg.src = country.flags.svg;
  flagImg.alt = `${country.name.common} flag`;
  flagContainer.appendChild(flagImg);

  const infoContainer = document.createElement('div');
  infoContainer.classList.add('details__info');

  const mainInfo = document.createElement('div');
  mainInfo.classList.add('details__info-main');

  const countryName = document.createElement('h2');
  countryName.classList.add('details__info-name');
  countryName.textContent = country.name.common;
  mainInfo.appendChild(countryName);

  const infoList = document.createElement('ul');
  infoList.classList.add('details__info-list');

  const firstColumn = document.createElement('div');
  const nativeNameLi = document.createElement('li');
  nativeNameLi.innerHTML = `<strong>Native Name:</strong> ${country.name.nativeName ? Object.values(country.name.nativeName)[0].common : 'N/A'}`;
  firstColumn.appendChild(nativeNameLi);

  const populationLi = document.createElement('li');
  populationLi.innerHTML = `<strong>Population:</strong> ${country.population ? country.population.toLocaleString() : 'N/A'}`;
  firstColumn.appendChild(populationLi);

  const regionLi = document.createElement('li');
  regionLi.innerHTML = `<strong>Region:</strong> ${country.region ? country.region : 'N/A'}`;
  firstColumn.appendChild(regionLi);

  const subRegionLi = document.createElement('li');
  subRegionLi.innerHTML = `<strong>Sub Region:</strong> ${country.subregion ? country.subregion : 'N/A'}`;
  firstColumn.appendChild(subRegionLi);

  const capitalLi = document.createElement('li');
  capitalLi.innerHTML = `<strong>Capital:</strong> ${country.capital && country.capital.length > 0 ? country.capital[0] : 'N/A'}`;
  firstColumn.appendChild(capitalLi);

  const secondColumn = document.createElement('div');
  const tldLi = document.createElement('li');
  tldLi.innerHTML = `<strong>Top Level Domain:</strong> ${country.tld ? country.tld.join(', ') : 'N/A'}`;
  secondColumn.appendChild(tldLi);

  const currenciesLi = document.createElement('li');
  currenciesLi.innerHTML = `<strong>Currencies:</strong> ${
    country.currencies
      ? Object.values(country.currencies)
          .map((c) => c.name)
          .join(', ')
      : 'N/A'
  }`;
  secondColumn.appendChild(currenciesLi);

  const languagesLi = document.createElement('li');
  languagesLi.innerHTML = `<strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}`;
  secondColumn.appendChild(languagesLi);

  infoList.appendChild(firstColumn);
  infoList.appendChild(secondColumn);
  mainInfo.appendChild(infoList);
  infoContainer.appendChild(mainInfo);

  const borderSection = document.createElement('div');
  borderSection.classList.add('details__info-border-countries');

  const borderLabel = document.createElement('strong');
  borderLabel.textContent = 'Border Countries:';
  borderSection.appendChild(borderLabel);

  const borderList = document.createElement('ul');
  borderList.classList.add('details__info-border-countries-list');

  if (country.borders && country.borders.length > 0) {
    const borderCountryNamesWithCode = await getBorderCountryNamesWithCode(
      country.borders
    );
    borderCountryNamesWithCode.forEach((border) => {
      const listItem = document.createElement('li');
      const listItemLink = document.createElement('a');
      listItem.classList.add('details__info-border-countries-item');
      listItemLink.href = `country/?name=${encodeURIComponent(border.name.common)}&code=${border.cca3}`;
      listItemLink.textContent = border.name.common;
      listItem.appendChild(listItemLink);
      borderList.appendChild(listItem);
    });
  } else {
    const noBordersItem = document.createElement('li');
    noBordersItem.textContent = 'None';
    borderList.appendChild(noBordersItem);
  }

  borderSection.appendChild(borderList);
  infoContainer.appendChild(borderSection);

  detailsContainer.appendChild(flagContainer);
  detailsContainer.appendChild(infoContainer);
}

async function getCountryDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const countryName = urlParams.get('name');
  const countryCode = urlParams.get('code');

  if (!countryName) {
    console.error('No country name provided in URL parameters.');
    return;
  }

  const cachedCountry = getDataFromSessionStorage(countryName);

  if (cachedCountry) {
    clearErrorElement();
    createCountryDetailsElement(cachedCountry);
    hideLoader();
    return;
  }

  let endpoint = '';
  if (countryCode) {
    endpoint = `https://restcountries.com/v3.1/alpha/${countryCode}`;
  } else {
    endpoint = `https://restcountries.com/v3.1/name/${countryName}`;
  }

  try {
    const response = await fetch(`${endpoint}`);

    if (!response.ok) {
      throw new Error('API returned an error status');
    }

    clearErrorElement();
    const data = await response.json();
    createCountryDetailsElement(data[0]);
    storeDataInSessionStorage(data[0]);
    suggestNextCountriesInDataList(data);
    hideLoader();
  } catch (error) {
    console.error('Error:', error);
    createErrorElement('Something went wrong. Please try again later.');
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', getCountryDetails);
