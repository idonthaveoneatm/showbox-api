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
# API Documentation
## Endpoints:
### `GET /search`

Search for movies or TV shows by title.

**Params:**
- `type`: `all`, `movie`, `tv`. default: `all`
- `keyword`: The title to search for.
- `page`: The page number. default: `1`
- `pagelimit`: The number of results per page. default: `20`

**Examples:**
- Search for TV shows with title "Breaking Bad":
```
http://localhost:3000/search?type=tv&keyword=breaking%20bad
```
- Search for movies with title "Ratatouille":
```
http://localhost:3000/search?type=movie&keyword=Ratatouille
```

### `GET /autocomplete`
Fetch autocomplete suggestions for a given title.

**Params:**
- `keyword`: The search term to autocomplete

**Example:**
- Get autocomplete suggestions for "breaking":
```
http://localhost:3000/autocomplete?keyword=breaking
```

### `GET /details`
Fetch details for a specific movie.

**Params:**
- `type`: `movie` or `tv`.
- `id`: The ID of the movie or show.

**Example:**
- Get details for movie with ID `899`:
```
http://localhost:3000/details?type=movie&id=899
```

### `GET /hot`
Gets the names of top media based on the type
**Params:**
- `type`: `movie` or `tv`
- `items`: Amount of media to return
**Example:**
```
http://localhost:3000/hot?type=movie&items=20
```

### `GET /toplist` (DISFUNCTIONAL)
Gets the names of lists of top media. I don't know how to get the contents of the list yet so use.
**Params:**
- `type`: `movie` or `tv`
**Example:**
```
http://localhost:3000/toplist?type=movie
```

### `GET /shareKey`
Retrieve the Febbox shareKey for a specific movie or TV show.

**Parameters:**
- `id`: The ID of the movie or show.
- `type`: `movie` or `tv`

**Example:**
Get FebBox ID for TV show with ID `125`:
```
http://localhost:3000/shareKey?type=tv&id=125
```

### `GET /files`
Fetch a list of files from a shared Febbox folder. Optionally, navigate subfolders using the `fid` parameter.

**Parameters:**
- `shareKey`: The share key of the Febbox folder.
- `fid`: The ID of the parent folder (default: 0).
**Headers:**
- `ui`: The ui token to check. defaults to the one configured in .env

**Examples:**
- Get file list from FebBox folder:
```
http://localhost:3000/files?shareKey=fNBTg8at
```
- Navigate to subfolder (e.g., `season`):
```
http://localhost:3000/files?shareKey=fNBTg8at&fid=2636635
```

### `GET /links`
Fetch download links for a specific file from Febbox.

**Parameters:**
- `shareKey`: The share key of the Febbox folder.
- `fid`: The file ID.
**Headers:**
- `ui`: The ui token to check. defaults to the one configured in .env
  
**Example:**
- Get download links for file with ID `2636650`:
```
http://localhost:3000/links?shareKey=fNBTg8at&fid=2636650
```

### `GET /api/febbox/quota`
Returns the transfer quota left on a token.
**Headers:**
- `ui`: The ui token to check. defaults to the one configured in .env

**Example:**
```
http://localhost:3000/quota
```

## Credits
- [tapframe](https://github.com/tapframe)'s [NuvioStreamsAddon](https://github.com/tapframe/NuvioStreamsAddon) had the code for the quota which I used
- [elsayed85](https://github.com/elsayed85)'s [showbox-api-package](https://github.com/elsayed85/showbox-api-package) which had some showbox api endpoints that weren't in this api