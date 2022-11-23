import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/main.css';
import throttle from 'lodash.throttle';
import { pixaBayApi } from './js/pixaBayApi';

const PER_PAGE = 40;
const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  buttonEl: document.querySelector('.load-more'),
  guard: document.querySelector('.js-guard'),
};
let page = 1;
const lightbox = new SimpleLightbox('.gallery a', {});

refs.searchForm.addEventListener('submit', onSubmitForm);

const observer = new IntersectionObserver(onScroll, {
  root: null,
  rootMargin: '700px',
  threshold: 1.0,
});

async function onSubmitForm(e) {
  e.preventDefault();

  const searchForm = e.currentTarget;
  const {
    searchQuery: { value: inputQuery },
  } = searchForm.elements;

  try {
    const data = await pixaBayApi(inputQuery, 1, PER_PAGE);

    if (!data.total) {
      Notify.failure(
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
    observer.observe(refs.guard);
  } catch (e) {
    console.info(e);
  }
}

function onScroll(entries, observer) {
  const {
    searchQuery: { value: inputQuery },
  } = refs.searchForm.elements;

  page++;

  try {
    entries.forEach(async entry => {
      if (entry.isIntersecting) {
        const data = await pixaBayApi(inputQuery, page, PER_PAGE);

        if (data.totalHits <= page * PER_PAGE) {
          Notify.failure(
            `We're sorry, but you've reached the end of search results.`
          );
          observer.unobserve(refs.guard);
        }

        refs.gallery.insertAdjacentHTML('beforeend', getImagesMarkup(data));
        lightbox.refresh();
      }
    });
  } catch (e) {
    console.info(e);
  }
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
          <b class="info-text">Likes:</b> <br/>${image.likes}
        </p>
        <p class="info-item">
          <b class="info-text">Views:</b> <br/>${image.views}
        </p>
        <p class="info-item">
          <b class="info-text">Comments:</b><br/>${image.comments}
        </p>
        <p class="info-item">
          <b class="info-text">Downloads:</b><br/> ${image.downloads}
        </p>
      </div>
    </div>`;
    })
    .join('');
}
