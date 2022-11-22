import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/main.css';
import throttle from 'lodash.throttle';
import { pixaBayApi } from './js/pixaBayApi';

const PER_PAGE = 10;
const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  buttonEl: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', onSubmitForm);
// refs.buttonEl.addEventListener('click', onMoreClick);
let page = 1;

const lightbox = new SimpleLightbox('.gallery a', {});
const onThrottleScroll = throttle(onScroll, 500);

function onScroll(e) {
  const endOfPage =
    window.innerHeight + window.scrollY >= document.body.offsetHeight;

  if (endOfPage) {
    onMoreClick();
  }
}

function onSubmitForm(e) {
  e.preventDefault();

  const searchForm = e.currentTarget;
  const {
    searchQuery: { value: inputQuery },
  } = searchForm.elements;

  pixaBayApi(inputQuery, 1, PER_PAGE).then(data => {
    console.log(data);
    if (!data.total) {
      Notify.success(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (refs.gallery.childElementCount > 0) {
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
      refs.gallery.innerHTML = '';
    }

    refs.gallery.innerHTML = getImagesMarkup(data);
    lightbox.refresh();
    window.addEventListener('scroll', onThrottleScroll);
    // refs.buttonEl.style.display = 'block';
  });
}

function onMoreClick(e) {
  const {
    searchQuery: { value: inputQuery },
  } = refs.searchForm.elements;
  page++;

  pixaBayApi(inputQuery, page, PER_PAGE).then(data => {
    if (data.totalHits <= page * PER_PAGE) {
      Notify.success(
        `We're sorry, but you've reached the end of search results.`
      );
      // refs.buttonEl.style.display = 'none';
      window.removeEventListener('scroll', onThrottleScroll);
    }

    refs.gallery.insertAdjacentHTML('beforeend', getImagesMarkup(data));
    lightbox.refresh();
  });

  smoothScroll();
}

function getImagesMarkup(data) {
  return data.hits
    .map(image => {
      return `<div class="photo-card">
      <a href="${image.largeImageURL}" class="photo-card-link">
        <img class="photo-card-img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes: ${image.likes}</b>
        </p>
        <p class="info-item">
          <b>Views: ${image.views}</b>
        </p>
        <p class="info-item">
          <b>Comments: ${image.comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads: ${image.downloads}</b>
        </p>
      </div>
    </div>`;
    })
    .join('');
}

function smoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
