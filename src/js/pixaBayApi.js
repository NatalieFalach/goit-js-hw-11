import axios from 'axios';
const URL = 'https://pixabay.com/api/';
const KEY = '31475535-1b9e5dc7305a97b8c78000937';

export async function pixaBayApi(query, page = 1, perPage = 40) {
  try {
    const response = await axios.get(`${URL}`, {
      params: {
        key: KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    });
    const data = await response.data;

    return data;
  } catch (e) {
    console.log('Error: ', e);
  }
}
