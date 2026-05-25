# Showbox + Febbox API
This repository provides an integration between two APIs: **Showbox** and **Febbox**. It allows developers to search for movies and TV shows, retrieve detailed information, and fetch files and download links associated with them via the **Febbox** platform.
## Packages Used
- **Node.js** (JavaScript runtime)
- **CryptoJS** (for encryption and decryption)
- **axios** (for making HTTP requests)
- **JSDOM** (for parsing HTML responses)
- **nanoid** (for generating unique IDs)
## Installation
### Clone the repository
```bash
git clone https://github.com/idonthaveoneatm/showbox-api
cd showbox-api

cp .env.example .env
```
### Configure `.env`
I don't know what `CHILD_MODE` does as it doesn't seem to suppress results.
```
FEBBOX_UI_COOKIE=''
API_PORT=3000
CHILD_MODE='0'
```
#### `FEBBOX_UI_COOKIE`

1. Visit [Febbox.com](https://www.febbox.com) and log in with Google (use a fresh account).
2. Open DevTools in your browser or inspect the page.
3. Go to the Application tab → Cookies.
4. Look for the cookie named `ui`.
5. Copy the `ui` cookie's value.
6. Close the tab, but **do NOT log out** to keep your token valid.

Do not share your UI token with others as it is tied to your account.

### Install Dependencies
```bash
npm install
```
## API Overview
### ShowboxAPI
Allows interaction with the [Showbox](https://showbox.media) platform to search for movies and TV shows, retrieve details, and fetch FebBox IDs associated with the content.
#### Methods
- `search(title, type, page, pagelimit)`: Search for movies or TV shows by title.
  - **title**: The movie or show title.
  - **type**: Type of content (`movie`, `tv`, `all`).
  - **page**: The page number (default: 1).
  - **pagelimit**: Number of results per page (default: 20).
- `getDetails(id, type)`: Get detailed information for a movie by its ID.
  - Type `1` for movie type `2` for tv
- `getFebBoxId(id, type)`: Retrieve the Febbox ID associated with a given movie or show.
  - Type `1` for movie type `2` for tv
- `getHot(type, items)`: I think it is popular media based on the type.
  - Type `movie` or `tv`
#### Configuration
If you want to edit the default configuration for the ShowboxAPI:
```js
const CONFIG = {
    BASE_URL: 'https://mbpapi.shegu.net/api/api_client/index/', 
    APP_KEY: 'moviebox',
    APP_ID: 'com.tdo.showbox',
    IV: 'wEiphTn!',
    KEY: '123d6cedf626dy54233aa1w6',
};
```
### FebboxAPI
Allows interactions with the [Febbox](https://febbox.com) platform to retrieve file lists and download links associated with Febbox share IDs.
#### Methods
- `getFileList(shareKey, parentId, isHtml)`: Get a list of files for a specific share.
- `getLinks(shareKey, fid)`: Retrieve download links for a specific file.
- `getQuoate(cookie)`: Returns the transfer quota of a cookie.
### Example Usage

Here’s a full example of how to use both APIs:
```js
import ShowboxAPI from './ShowboxAPI.js';
import FebboxAPI from './FebboxAPI.js';

(async () => {
    const api = new ShowboxAPI();
    const febboxApi = new FebboxAPI();

    // Movie
    const movieTitle = 'ratatouille';
    const results = await api.search(movieTitle, 'movie');
    const movie = results[0];
    console.log('🎬 Movie:', movie);

    let febBoxId = await api.getFebBoxId(movie.id, movie.box_type);
    if (febBoxId) {
        console.log('🔗 FebBox ID:', febBoxId);
        const files = await febboxApi.getFileList(febBoxId);
        console.log('📂 File List:', files);
        const file = files[1];
        const links = await febboxApi.getLinks(febBoxId, file.fid);
        console.log('🌐 Links:', links);
    }

    // Show
    const showTitle = 'breaking bad';
    const showResults = await api.search(showTitle, 'tv');
    const show = showResults[0];
    console.log('📺 Show:', show);

    const showId = show.id;
    const showDetails = await api.getShowDetails(showId);
    console.log('📜 Show Details:', showDetails);

    febBoxId = await api.getFebBoxId(show.id, show.box_type);
    if (febBoxId) {
        const files = await febboxApi.getFileList(febBoxId);
        console.log('📂 File List:', files);
        const file = files[4];
        if (file.is_dir) {
            const seasonFiles = await febboxApi.getFileList(febBoxId, file.fid);
            console.log('📂 Season Files:', seasonFiles);
            const seasonFile = seasonFiles[0];
            const links = await febboxApi.getLinks(febBoxId, seasonFile.fid);
            console.log('🌐 Season Links:', links);
        } else {
            const links = await febboxApi.getLinks(febBoxId, file.fid);
            console.log('🌐 Links:', links);
        }
    }
})();
```
## Docker Setup
To build and start the application in detached mode, use:
```bash
docker-compose up -d --build
```
# API Documentation
## Base URL
```
http://localhost:3000/api
```
## Endpoints:
### `GET /api/search`

Search for movies or TV shows by title.

**Params:**
- `type`: `all`, `movie`, `tv`. default: `all`
- `title`: The title to search for.
- `page`: The page number. default: `1`
- `pagelimit`: The number of results per page. default: `20`

**Examples:**
- Search for TV shows with title "Breaking Bad":
```
http://localhost:3000/api/search?type=tv&title=breaking%20bad
```
- Search for movies with title "Ratatouille":
```
http://localhost:3000/api/search?type=movie&title=Ratatouille
```

### `GET /api/autocomplete`
Fetch autocomplete suggestions for a given title.

**Params:**
- `keyword`: The search term to autocomplete

**Example:**
- Get autocomplete suggestions for "breaking":
```
http://localhost:3000/api/autocomplete?keyword=breaking
```

### `GET /api/details`
Fetch details for a specific movie.

**Params:**
- `id`: The ID of the movie or show.
- `type`: The type of content. `1` is movie and `2` is tv

**Example:**
- Get details for movie with ID `899`:
```
http://localhost:3000/api/details?id=899&type=1
```

### `GET /api/hot`
Gets the names of top media based on the type
**Params:**
- `type`: `movie` or `tv`
- `items`: Amount of media to return
**Example:**
```
http://localhost:3000/api/hot?type=movie&items=20
```

### `GET /api/toplist/:type` (DISFUNCTIONAL)
Gets the names of lists of top media. I don't know how to get the contents of the list yet so use.
**Params:**
- `type`: `1` for movie or `2` for tv
**Example:**
```
http://localhost:3000/api/toplist/1
```

### `GET /api/febbox/shareKey/:id/:type`
Retrieve the Febbox shareKey for a specific movie or TV show.

**Parameters:**
- `id`: The ID of the movie or show.
- `type`: The type of content. `1` is movie and `2` is tv

**Example:**
Get FebBox ID for TV show with ID `125`:
```
http://localhost:3000/api/febbox/shareKey/125/2
```

### `GET /api/febbox/files/:shareKey`
Fetch a list of files from a shared Febbox folder. Optionally, navigate subfolders using the `fid` parameter.

**Parameters:**
- `shareKey`: The share key of the Febbox folder.
- `fid`: The ID of the parent folder (default: 0).

**Examples:**
- Get file list from FebBox folder:
```
http://localhost:3000/api/febbox/files/fNBTg8at
```
- Navigate to subfolder (e.g., `season`):
```
http://localhost:3000/api/febbox/files/fNBTg8at?fid=2636635
```

### `GET /api/febbox/links/:shareKey/:fid`
Fetch download links for a specific file from Febbox.

**Parameters:**
- `shareKey`: The share key of the Febbox folder.
- `fid`: The file ID.
  
**Example:**
- Get download links for file with ID `2636650`:
```
http://localhost:3000/api/febbox/links/fNBTg8at/2636650
```

### `GET /api/febbox/quota`
Returns the transfer quota left on a token.
**Parameters:**
- `ui`: The ui token to check. defaults to the one configured in .env

**Example:**
```
http://localhost:3000/api/febbox/quota?ui=ey...
```

## Credits
- [tapframe](https://github.com/tapframe)'s [NuvioStreamsAddon](https://github.com/tapframe/NuvioStreamsAddon) had the code for the quota which I used
- [elsayed85](https://github.com/elsayed85)'s [showbox-api-package](https://github.com/elsayed85/showbox-api-package) which had some showbox api endpoints that weren't in this api