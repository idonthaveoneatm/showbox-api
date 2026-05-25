import CryptoJS from 'crypto-js';
import { customAlphabet } from 'nanoid';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const CONFIG = {
    BASE_URL: 'https://mbpapi.shegu.net/api/api_client/index/',
    APP_KEY: 'moviebox',
    APP_ID: 'com.tdo.showbox',
    IV: 'wEiphTn!',
    KEY: '123d6cedf626dy54233aa1w6',
    DEFAULTS: {
        CHILD_MODE: process.env.CHILD_MODE || '0',
        APP_VERSION: '14.0',
        LANG: 'en',
        PLATFORM: 'android',
        CHANNEL: 'Website',
        APPID: '27',
        VERSION: '154',
        MEDIUM: 'Website',
    }
};

const nanoid = customAlphabet('0123456789abcdef', 32);

class ShowboxAPI {
    constructor() {
        this.baseUrl = CONFIG.BASE_URL;
    }

    encrypt(data) {
        return CryptoJS.TripleDES.encrypt(
            data,
            CryptoJS.enc.Utf8.parse(CONFIG.KEY),
            { iv: CryptoJS.enc.Utf8.parse(CONFIG.IV) }
        ).toString();
    }

    generateVerify(encryptedData) {
        return CryptoJS.MD5(
            CryptoJS.MD5(CONFIG.APP_KEY).toString() + CONFIG.KEY + encryptedData
        ).toString();
    }

    getExpiryTimestamp() {
        return Math.floor(Date.now() / 1000 + 60 * 60 * 12);
    }

    async request(module, params = {}) {
        const requestData = {
            ...CONFIG.DEFAULTS,
            expired_date: this.getExpiryTimestamp(),
            module,
            ...params,
        };

        const encryptedData = this.encrypt(JSON.stringify(requestData));
        const body = JSON.stringify({
            app_key: CryptoJS.MD5(CONFIG.APP_KEY).toString(),
            verify: this.generateVerify(encryptedData),
            encrypt_data: encryptedData,
        });

        const formData = new URLSearchParams({
            data: Buffer.from(body).toString('base64'),
            appid: CONFIG.DEFAULTS.APPID,
            platform: CONFIG.DEFAULTS.PLATFORM,
            version: CONFIG.DEFAULTS.VERSION,
            medium: CONFIG.DEFAULTS.MEDIUM,
        });

       const response = await axios.post(this.baseUrl,
        `${formData.toString()}&token${nanoid()}`, 
        {
            headers: {
                'Platform': CONFIG.DEFAULTS.PLATFORM,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'okhttp/3.2.0',
            }
        });

        return response.data;
    }

    async search(title, type = 'all', page = 1, pagelimit = 20) {
        return this.request('Search5', { page, type, keyword: title, pagelimit }).then(data => {
            return data.data;
        });
    }

    async getDetails(id, type) {
        return this.request(type == 1 ? 'Movie_detail' : 'TV_detail_v2', type == 1 ? { mid: id } : { tid: id }).then(data => {
            return data.data
        });
    }

    async getHot(type = 'movie', items = null) {
        return this.request('Search_hot', {type: type, pagelimit: items}).then(data => {
            return data.data
        })
    }

    async getTopList(type) {
        return this.request('Top_list', {box_type: type}).then(data => {
            return data.data
        })
    }
    
    /**async getTopListContent(type, list, page = 1, pagelimit = 20) {
        return this.request(type == 1 ? 'Top_list_movie' : 'Top_list_tv', {id: list, page: page, pagelimit: pagelimit}).then(data => {
            return data
        })
    }**/

    /**async getEpisodes(showId, season) {
        return this.request('TV_episode', {tid: showId, season: season}).then(data => {
            return data
        })
    }**/

    async getFebBoxId(id, type) {
        const response = await axios.get(`https://www.showbox.media/index/share_link?id=${id}&type=${type}`);
        const data = await response.data;
        return data?.data?.link?.split('/').pop();
    }

    async getAutocomplete(keyword , pagelimit = 5) {
        return this.request('Autocomplate2', { keyword, pagelimit: pagelimit }).then(data => {
            return data.data;
        });
    }
}

export default ShowboxAPI;