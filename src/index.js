import axios from 'axios'
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';



const refs = {
    form: document.querySelector('.search-form'),
    loadMore: document.querySelector('.load-more'),
    gallery: document.querySelector('.gallery'),
}

let page = 1;
let elements = 0;
let name = null;

refs.form.addEventListener('submit', onSearch);

function clearLoadMore() {
    refs.loadMore.style.display = 'none';
}

function addLoadMore() {
    refs.loadMore.style.display = 'block';
}

clearLoadMore();

function onSearch(event) {
    event.preventDefault();

    refs.gallery.innerHTML = '';
     name = event.target.elements[0].value.trim();
    if (name !== "") {
        pixabayApi(name);
        renderPhoto();
        addLoadMore();
      
    } else {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.'); 
        clearLoadMore();
    }

}

const BASE_URL = 'https://pixabay.com/api/';

async function pixabayApi(name, page) {
    const options = {
        params: {
            key: '33032852-f9b14fb0441fac63083ffdb75',
            q: name,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'safesearch',
            page,
            per_page: 40,
        }
    }

    try {
        const resp = await axios.get(BASE_URL, options);
        elements += resp.data.hits.length;
        

        if (!resp.data.hits.length) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } 

        if (elements >= resp.data.totalHits) {
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
            clearLoadMore();
        }

        return resp.data

    } catch (error) {
        console.log(error);
    }
};

async function renderPhoto() {
    const res = await pixabayApi(name, page);
    console.log(res)
    createMarkup(res);
}


let originalGallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function createMarkup(data) {
    const markup = data.hits.map(({ largeImageURL: bigImg, webformatURL: img, tags, likes, views, comments, downloads }) =>
        `<a class="photo-link" href="${bigImg}">
            <div class="photo-card">
                <div class="photo">
                    <img src="${img}" alt="${tags}" loading="lazy" />
                </div>
                    <div class="info">
                        <p class="info-item">
                        <b>Likes ${likes}</b>
                        </p>
                        <p class="info-item">
                        <b>Views ${views}</b>
                        </p>
                        <p class="info-item">
                        <b>Comments ${comments}</b>
                        </p>
                        <p class="info-item">
                        <b>Downloads ${downloads}</b>
                        </p>
                    </div>  
                </div>
                </a>`).join('');

    refs.gallery.insertAdjacentHTML('beforeend', markup);
    originalGallery.refresh();
};





refs.loadMore.addEventListener('click', onLoadMore);

function onLoadMore() {
    page += 1
    pixabayApi(name, page);
    renderPhoto();
    addLoadMore();   
}
