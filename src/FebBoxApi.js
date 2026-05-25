import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';
import axios from 'axios'

dotenv.config();

const FEBBOX_UI_COOKIE = process.env.FEBBOX_UI_COOKIE;

class FebboxAPI {
    constructor() {
        this.baseUrl = 'https://www.febbox.com';
        this.headers = this._getDefaultHeaders();
        this._setAuthCookie(FEBBOX_UI_COOKIE);
    }

    _setAuthCookie(cookie) {
        if (!cookie) {
            return this;
        }

        this.headers.cookie = `ui=${cookie}`;
        return this;
    }

    _getDefaultHeaders() {
        return {
            'x-requested-with': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
        };
    }

    _setReferer(shareKey) {
        this.headers.referer = `${this.baseUrl}/share/${shareKey}`;
    }

    async _fetchJson(url, cookie = null) {
        const headers = {
            ...this.headers,
            ...(cookie ? { cookie: `ui=${cookie}` } : {})
        };

        const response = await axios.get(url, {
            headers,
            timeout: 8000,
            validateStatus: () => true
        });

        if (response.status !== 200) throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
        return response.data;
    }

    async getFileList(shareKey, parentId = 0 , cookie = null) {
        const url = `${this.baseUrl}/file/file_share_list?share_key=${shareKey}&pwd=&parent_id=${parentId}&is_html=0`;
        this._setReferer(shareKey);

        const data = await this._fetchJson(url , cookie);
        return data.data.file_list;
    }

    async getLinks(shareKey, fid , cookie = null) {
        const url = `${this.baseUrl}/console/video_quality_list?fid=${fid}`;
        this._setReferer(shareKey);

        const data = await this._fetchJson(url, cookie);
        const htmlResponse = data.html;
        const dom = new JSDOM(htmlResponse);
        const doc = dom.window.document;

        return this._extractFileQualities(doc);
    }

    async getQuota(cookie = null) {
        const url = `${this.baseUrl}/console/user_cards`
        const resp = await this._fetchJson(url, cookie)

        if (resp.data && resp.data.data && resp.data.data.flow) {
            const flow = resp.data.data.flow;
            const remaining = (Number(flow.traffic_limit_mb) || 0) - (Number(flow.traffic_usage_mb) || 0);
            return { ok: true, remainingMB: remaining };
        }
        return { ok: false, remainingMB: -1 };
    }

    _extractFileQualities(doc) {
        return Array.from(doc.querySelectorAll('.file_quality')).map(fileDiv => {
            const url = fileDiv.getAttribute('data-url');
            const quality = fileDiv.getAttribute('data-quality');
            const name = fileDiv.querySelector('.name')?.textContent.trim();
            const speed = fileDiv.querySelector('.speed span')?.textContent.trim();
            const size = fileDiv.querySelector('.size')?.textContent.trim();

            return { url, quality, name, speed, size };
        });
    }
}

export default FebboxAPI;