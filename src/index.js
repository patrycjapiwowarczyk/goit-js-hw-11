import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { debounce } from 'lodash';
import './css/styles.css';

const searchForm = document.querySelector('#search-form');
const searchFormInput = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const galleryButton = document.querySelector('.load-more');
const footer = document.querySelector('.footer');

const lightbox = new SimpleLightbox('.gallery__imgbox a');

let page = 1;
let pagesNumber;
let lastSearched = null;
let visibility = false;

async function fetchingImages(searchedInput, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '33195802-8138848f2bbeb34e6b62aa9d8',
        q: searchedInput,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    pagesNumber = Math.ceil(response.data.totalHits / 40);

    if (response.data.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (page === 1) {
      Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    }
    return response.data.hits;
  } catch (error) {
    console.log(error);
  }
}

function updatingGallery(imgData) {
  let galleryCardHtml = ``;
  imgData.forEach(image => {
    galleryCardHtml += `
    <div class="gallery__card">
    <div class="gallery__imgbox">
    <a href="${image.largeImageURL}">
    <img class="gallery__img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy"/>
    </a>
    </div>
    <div class="gallery__info">
      <p class="gallery__item-info">
        <b>Likes </b> ${image.likes}
      </p>
      <p class="gallery__item-info">
        <b>Views </b>${image.views}
      </p>
      <p class="gallery__item-info">
        <b>Comments </b>${image.comments}
      </p>
      <p class="gallery__item-info">
        <b>Downloads </b>${image.downloads}
      </p>
    </div>
  </div>`;
  });

  gallery.innerHTML += galleryCardHtml;
  lightbox.refresh();
}

const debouncing = debounce(async function () {
  const searchedInput = searchFormInput.value;

  if (searchedInput === lastSearched) {
    return;
  } else {
    gallery.innerHTML = '';
  }

  lastSearched = searchedInput;
  page = 1;

  const imgData = await fetchingImages(searchedInput, page);
  updatingGallery(imgData);
}, 250);

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  debouncing();
});

function loadMoreImages (totalHits) {
  let totalPages = totalHits / per_page;

  if (totalPages > page || page === totalPages) {
page =+ 1;
visibility = true;
galleryButton.classList.remove("hidden");
galleryButton.addEventListener("click", debouncing);
  }

  else if (page > totalPages && totalPages !== 0) {
    galleryButton.classList.add("hidden");
    Notify.failure("We're sorry, but you've reached the end of search results.")
  }

  else if (page > totalPages) {
    visibility = false;
    galleryButton.classList.add("hidden");
  }
}

function smoothScrolling () {
  if (visibility) {
    const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
  }
}

