import * as Carousel from "./Carousel.js";
import axios from "axios";

const API_KEY = "live_c9JRxODp7e1kv8NKHDnpYt14QZmPlgw2Llw6HMJgrWQP8wlcXVd98U8ac7HCi5lp";

// HTML Elements
const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavouritesBtn = document.getElementById("getFavouritesBtn");


async function initialLoad() {
  try {
  
    const response = await axios.get("https://api.thecatapi.com/v1/breeds", {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    response.data.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    breedSelect.addEventListener("change", handleBreedSelect);

    handleBreedSelect();
  } catch (error) {
    console.error("Error loading breeds:", error);
  }
}

async function handleBreedSelect() {
  try {
    Carousel.clearCarousel();
    infoDump.innerHTML = "";

    const breedId = breedSelect.value;

    const response = await axios.get(
      `https://api.thecatapi.com/v1/images/search?limit=5&breed_id=${breedId}`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    response.data.forEach((cat) => {
      const carouselItem = Carousel.createCarouselItem(cat.url, cat.id);
      Carousel.appendCarouselItem(carouselItem);
    });

    const breedInfo = response.data[0].breeds[0];
    const infoHTML = `
      <h2>${breedInfo.name}</h2>
      <p>${breedInfo.description}</p>
      <p>Origin: ${breedInfo.origin}</p>
      <p>Life Span: ${breedInfo.life_span}</p>
    `;
    infoDump.innerHTML = infoHTML;
  } catch (error) {
    console.error("Error handling breed selection:", error);
  }
}

axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;

axios.interceptors.request.use((config) => {
  console.log("Request started:", config);
  progressBar.style.width = "0%";
  document.body.style.cursor = "progress";
  return config;
});

axios.interceptors.response.use(
  (response) => {
    console.log("Request completed:", response);
    return response;
  },
  (error) => {
    console.error("Request failed:", error);
    return Promise.reject(error);
  }
);

function updateProgress(event) {
  const progress = (event.loaded / event.total) * 100;
  progressBar.style.width = `${progress}%`;
}

axios.interceptors.request.use((config) => {
  config.onDownloadProgress = updateProgress;
  return config;
});

axios.interceptors.request.use(() => {
  document.body.style.cursor = "progress";
  return config;
});

axios.interceptors.response.use(
  (response) => {
    document.body.style.cursor = "default";
    return response;
  },
  (error) => {
    document.body.style.cursor = "default";
    return Promise.reject(error);
  }
);

export async function favourite(imgId) {
  try {
    const response = await axios.post("/favourites", { image_id: imgId });
    console.log("Image favourited:", response.data);
  } catch (error) {
    console.error("Error favouriting image:", error);
  }
}

function getFavourites() {
  axios.get("/favourites")
    .then((response) => {
      Carousel.clearCarousel();
      response.data.forEach((favourite) => {
        const carouselItem = Carousel.createCarouselItem(favourite.image.url, favourite.image.id);
        Carousel.appendCarouselItem(carouselItem);
      });
    })
    .catch((error) => {
      console.error("Error getting favourites:", error);
    });
}

getFavouritesBtn.addEventListener("click", getFavourites);

initialLoad();

  
