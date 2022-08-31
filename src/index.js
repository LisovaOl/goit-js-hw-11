import './css/slyles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import fetchImages from './js/ImgApiService';
import appendImagesMarkup from './js/renderImages';

const refs = {
  searchForm: document.querySelector('#search-form'),
  imagesContainer: document.querySelector('.gallery'),
  infiniteScroll: document.querySelector('.more'),
};

const observer = new IntersectionObserver(onLoadMore, {
  root: null,
  rootMargin: '300px',
  treshold: 1,
});

refs.searchForm.addEventListener('submit', onSearch);

let simplelightbox = null;
let page = 1;
let query = '';
const perPage = 40;
let fetchedAll = false;

function onSearch(event) {
  event.preventDefault();

  page = 1;
  query = event.currentTarget.searchQuery.value.trim();

  observer.unobserve(refs.infiniteScroll);
  clearImagesContainer();

  if ('' === query) {
    Notify.warning('No empty search');
    return;
  }

  fetchImages(query, page, perPage)
    .then(data => {
      appendImagesMarkup(data.hits);
      simplelightbox = new SimpleLightbox('.gallery a').refresh();
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
      observer.observe(refs.infiniteScroll);
    })

    .catch(error => {
      Notify.failure('Oooops, something went wrong, try again');
    });
}

async function onLoadMore(data) {
  if (data[0].isIntersecting) {
    if (fetchedAll) {
      Notify.info(
        "We are sorry, but you've reached the end of search results."
      );
      observer.unobserve(refs.infiniteScroll);
      return;
    }

    page += 1;

  try { await fetchImages(query, page, perPage)
    .then(data => {
      appendImagesMarkup(data.hits);
      const fetchedImages = (page - 1) * perPage + data.hits.length;
        // console.log(fetchedImages)
        if (fetchedImages >= data.totalHits) {
          Notify.info(
            "We are sorry, but you've reached the end of search results."
          );
        }
        // console.log(fetchedAll);
      })
    }
      catch(error) {
        Notify.failure('Oooops, something went wrong, try again');
      };
  }
}

function clearImagesContainer() {
  refs.imagesContainer.innerHTML = '';
}
