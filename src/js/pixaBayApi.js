const URL = 'https://pixabay.com/api/';
const KEY = '31475535-1b9e5dc7305a97b8c78000937';

export function pixaBayApi(query, page = 1, perPage = 40) {
  const params = new URLSearchParams({
    key: KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
  });

  return fetch(`${URL}?${params.toString()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(data => data);
}
