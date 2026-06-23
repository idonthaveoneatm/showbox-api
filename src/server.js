import express from 'express'
import cors from 'cors'
import ShowboxAPI from './ShowboxAPI.js'
import FebboxAPI from './FebBoxApi.js'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const app = express()
const port = process.env.API_PORT || 3000
const showboxAPI = new ShowboxAPI()
const febboxAPI = new FebboxAPI()

app.use(cors())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

app.use(express.json())

app.get('/', (req, res) => {
    res.json({note: "api is up", repo: "https://github.com/idonthaveoneatm/showbox-api"})
})

app.get('/autocomplete', async (req, res) => {
    const { keyword, pagelimit } = req.query
    try {
        const results = await showboxAPI.getAutocomplete(keyword, pagelimit)
        res.json(results)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/search', async (req, res) => {
    const { type = 'all', keyword, page = 1, pagelimit = 20} = req.query
    try {
        const results = await showboxAPI.search(keyword, type, page, pagelimit)
        res.json(results)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/hot', async (req, res) => {
    const {type, items=20} = req.query
    try {
        const data = await showboxAPI.getHot(type === "movie" ? 1 : 2, items)
        res.json(data)
    } catch (error){
        res.status(500).json({ error: error.message })
    }
})

app.get('/toplist', async (req, res) => {
    const {type} = req.query
    try {
        const data = await showboxAPI.getTopList(type === "movie" ? 1 : 2)
        res.json(data)
    } catch (error){
        res.status(500).json({ error: error.message })
    }
})

app.get('/details', async (req, res) => {
    const { id, type } = req.query
    try {
        const details = await showboxAPI.getDetails(id, type)
        res.json(details)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }   
})

app.get('/shareKey', async (req, res) => {
    const { id, type } = req.query
    try {
        const febBoxId = await showboxAPI.getFebBoxId(id, type === "movie" ? 1 : 2)
        res.json(febBoxId)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/files', async (req, res) => {
    const { shareKey, fid } = req.query
    const cookie = req.headers['ui'] || null
    try {
        const files = await febboxAPI.getFileList(shareKey, fid , cookie)
        res.json(files)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/links', async (req, res) => {
    const { shareKey, fid } = req.query
    const cookie = req.headers['ui'] || null
    try {
        const links = await febboxAPI.getLinks(shareKey, fid , cookie)
        res.json(links)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/quota', async (req, res) => {
    const cookie = req.headers['ui'] || null
    const result = await febboxAPI.getQuota(cookie)
    res.json(result)
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

/**
These need update app ID:
{"code":0,"msg":"Please upgrade the app to the latest version.","data":[]}
but I dont know how to get and it may break other things

app.get('/api/episodes', async (req, res) => {
    const {id, season} = req.query
    try {
        const data = await showboxAPI.getEpisodes(id, season)
        res.json(data)
    } catch (error){
        res.status(500).json({ error: error.message })
    }
})

app.get('/api/toplist/content', async (req, res) => {
    const { type, id, page, pagelimit } = req.query
     try {
        const data = await showboxAPI.getTopListContent(type, id, page, pagelimit)
        res.json(data)
    } catch (error){
        res.status(500).json({ error: error.message })
    }
})
**/