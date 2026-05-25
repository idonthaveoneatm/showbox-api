import express from 'express';
import cors from 'cors';
import ShowboxAPI from './ShowboxAPI.js';
import FebboxAPI from './FebBoxApi.js';
import dotenv from 'dotenv';
import axios from 'axios'

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3000;

app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.use(express.json());

const showboxAPI = new ShowboxAPI();
const febboxAPI = new FebboxAPI();

app.get('/', (req, res) => {
    res.send('Showbox and Febbox API is working!');
});

app.get('/api/autocomplete', async (req, res) => {
    const { keyword, pagelimit } = req.query;
    try {
        const results = await showboxAPI.getAutocomplete(keyword, pagelimit);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    const { type = 'all', title, page = 1, pagelimit = 20 } = req.query;
    try {
        const results = await showboxAPI.search(title, type, page, pagelimit);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/details', async (req, res) => {
    const { id, type } = req.query;
    try {
        const details = await showboxAPI.getDetails(id, type)
        res.json(details)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/api/hot', async (req, res) => {
    const {type='movie', items=1} = req.query
    try {
        const data = await showboxAPI.getHot(type, items)
        res.json(data)
    } catch (error){
        res.status(500).json({ error: error.message });
    }
})

app.get('/api/toplist/:type', async (req, res) => {
    const {type} = req.params
    try {
        const data = await showboxAPI.getTopList(type)
        res.json(data)
    } catch (error){
        res.status(500).json({ error: error.message });
    }
})

// These need update app ID:
// {"code":0,"msg":"Please upgrade the app to the latest version.","data":[]}
// but I dont know how to get and it may break other things

/**app.get('/api/episodes', async (req, res) => {
    const {id, season} = req.query
    try {
        const data = await showboxAPI.getEpisodes(id, season)
        res.json(data)
    } catch (error){
        res.status(500).json({ error: error.message });
    }
})**/

/**app.get('/api/toplist/content', async (req, res) => {
    const { type, id, page, pagelimit } = req.query
     try {
        const data = await showboxAPI.getTopListContent(type, id, page, pagelimit)
        res.json(data)
    } catch (error){
        res.status(500).json({ error: error.message });
    }
})**/

app.get('/api/febbox/shareKey/:id/:type', async (req, res) => {
    const { id, type } = req.params;
    try {
        const febBoxId = await showboxAPI.getFebBoxId(id, type);
        res.json({"shareKey" : febBoxId});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/febbox/files/:shareKey', async (req, res) => {
    const { shareKey } = req.params;
    const { fid } = req.query;
    const cookie = req.headers['x-auth-cookie'] || null;
    try {
        const files = await febboxAPI.getFileList(shareKey, fid , cookie);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/febbox/links/:shareKey/:fid', async (req, res) => {
    const { shareKey, fid } = req.params;
    const cookie = req.headers['x-auth-cookie'] || null;
    try {
        const links = await febboxAPI.getLinks(shareKey, fid , cookie);
        res.json(links);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/febbox/quota', async (req, res) => {
    const { ui = null } = req.query;
    const result = await febboxAPI.getQuota(ui)
    res.json(result)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
