import { COUNTRIES_DATA_KEY } from '../scripts/constants.js';
import { createErrorElement, clearErrorElement } from '../scripts/helpers.js';

function getAllDataFromSessionStorage() {
  const data = sessionStorage.getItem(COUNTRIES_DATA_KEY);
  return JSON.parse(data);
}

function getDataFromSessionStorage() {
  const urlParams = new URLSearchParams(window.location.search);
  const countryName = decodeURIComponent(urlParams.get('name'));
  const data = sessionStorage.getItem(COUNTRIES_DATA_KEY);
  const countryData = JSON.parse(data).find(
    (c) => c.name.common === countryName
  );

  return countryData;
}

function getBorderCountryNames(borderCodes) {
  const data = getAllDataFromSessionStorage();
  if (!data) {
    console.error('No country data found in sessionStorage.');
    return [];
  }

  const borderCountryNames = borderCodes.map((code) => {
    const country = data.find((c) => c.cca3 === code);
    return country ? country.name.common : code;
  });

  return borderCountryNames;
}

function createCountryDetailsElement(country) {
  const countryData = getDataFromSessionStorage();

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
  flagImg.src = countryData.flags.svg;
  flagImg.alt = `${countryData.name.common} flag`;
  flagContainer.appendChild(flagImg);

  const infoContainer = document.createElement('div');
  infoContainer.classList.add('details__info');

  const mainInfo = document.createElement('div');
  mainInfo.classList.add('details__info-main');

  const countryName = document.createElement('h2');
  countryName.classList.add('details__info-name');
  countryName.textContent = countryData.name.common;
  mainInfo.appendChild(countryName);

  const infoList = document.createElement('ul');
  infoList.classList.add('details__info-list');

  const firstColumn = document.createElement('div');
  const nativeNameLi = document.createElement('li');
  nativeNameLi.innerHTML = `<strong>Native Name:</strong> ${Object.values(countryData.name.nativeName)[0].common}`;
  firstColumn.appendChild(nativeNameLi);

  const populationLi = document.createElement('li');
  populationLi.innerHTML = `<strong>Population:</strong> ${countryData.population.toLocaleString()}`;
  firstColumn.appendChild(populationLi);

  const regionLi = document.createElement('li');
  regionLi.innerHTML = `<strong>Region:</strong> ${countryData.region}`;
  firstColumn.appendChild(regionLi);

  const subRegionLi = document.createElement('li');
  subRegionLi.innerHTML = `<strong>Sub Region:</strong> ${countryData.subregion}`;
  firstColumn.appendChild(subRegionLi);

  const capitalLi = document.createElement('li');
  capitalLi.innerHTML = `<strong>Capital:</strong> ${countryData.capital ? countryData.capital[0] : 'N/A'}`;
  firstColumn.appendChild(capitalLi);

  const secondColumn = document.createElement('div');
  const tldLi = document.createElement('li');
  tldLi.innerHTML = `<strong>Top Level Domain:</strong> ${countryData.tld ? countryData.tld.join(', ') : 'N/A'}`;
  secondColumn.appendChild(tldLi);

  const currenciesLi = document.createElement('li');
  currenciesLi.innerHTML = `<strong>Currencies:</strong> ${
    countryData.currencies
      ? Object.values(countryData.currencies)
          .map((c) => c.name)
          .join(', ')
      : 'N/A'
  }`;
  secondColumn.appendChild(currenciesLi);

  const languagesLi = document.createElement('li');
  languagesLi.innerHTML = `<strong>Languages:</strong> ${countryData.languages ? Object.values(countryData.languages).join(', ') : 'N/A'}`;
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
    const borderCountryNames = getBorderCountryNames(country.borders);
    borderCountryNames.forEach((name) => {
      const listItem = document.createElement('li');
      const listItemLink = document.createElement('a');
      listItem.classList.add('details__info-border-countries-item');
      listItemLink.href = `?name=${encodeURIComponent(name)}`;
      listItemLink.textContent = name;
      listItem.appendChild(listItemLink);
      borderList.appendChild(listItem);
    });
  } else {
    const noBordersItem = document.createElement('li');
    noBordersItem.classList.add('details__info-border-countries-item');
    noBordersItem.textContent = 'None';
    borderList.appendChild(noBordersItem);
  }

  borderSection.appendChild(borderList);
  infoContainer.appendChild(borderSection);

  detailsContainer.appendChild(flagContainer);
  detailsContainer.appendChild(infoContainer);
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.remove();
  }
}

async function getCountryDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const countryName = urlParams.get('name');

  if (!countryName) {
    console.error('No country name provided in URL parameters.');
    return;
  }

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}`
    );
    if (!response.ok) {
      throw new Error('API returned an error status');
    }
    clearErrorElement();
    const data = await response.json();
    createCountryDetailsElement(data[0]);
    console.log(data);

    hideLoader();
    return data;
  } catch (error) {
    console.error('Error:', error);
    createErrorElement('Something went wrong. Please try again later.');

    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', getCountryDetails);
