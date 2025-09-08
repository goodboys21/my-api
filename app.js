const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const cors = require('cors');
const AdmZip = require('adm-zip');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fflate = require('fflate');
const qs = require('qs');
const cheerio = require('cheerio');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types'); 
const VALID_API_KEYS = ['bagus']; // Ganti dengan daftar API key yang valid
const upload = multer({ storage: multer.memoryStorage() });// Vercel/Lambda bisa tulis ke sini
const MEDIAFIRE_SESSION_TOKEN = '0cffb9e4079cb03796d5add57d3d04ef2a483664395e1746f72730b86d5b7af8132bae4f959371f231541601a478ac5abff949fe45b4be6ea88e5d727e898b725b98fbde2f587c55';
/*const DOMAIN_CONFIGS = [
    {
    domain: 'freedply.my.id',
    vercelToken: 'SdNT1RzRL1MSOLkCkXz95qtj',
    cloudflareToken: 'vtyOUXd3ZUOhjpj_v2Itwwo_bNn1uvni-0wYe2e7',
    cloudflareZoneId: '8a88fce12c78838004dd7f86f542b53c'
  },
{
domain: 'panel-xyz.biz.id',
    vercelToken: 'LdDnojcgKsJyZyzlzkAuAl2g',
    cloudflareToken: 'b3BLEOXLFduY3sJhbfob_GCMEgSTDZzXTu4DL9BI',
    cloudflareZoneId: '64123b2121f034f393319701eed024ec'
  },
{
    domain: 'panelmaster.biz.id',
    vercelToken: '2JOEg8cXP65jRgaT1ZHrjmoq',
    cloudflareToken: 'HILVUqKR7rz5KS6guzEsoDzBgXNJDsw_LQZj6xC3',
    cloudflareZoneId: '0d329e82b14dd850acf441b1e520684f'
  }
];*/
const DOMAIN_CONFIGS = [
  {
    domain: 'btwo.my.id',
    vercelToken: 'WUT8w8KTOS06pNCCg5lJi3E3',
    cloudflareToken: 'aOF69Mpldo1rJNmiBJxgADn1h7IUUlePe5i4U3fC',
    cloudflareZoneId: 'c289963e9af1196df19f290b3e9b41fa'
  },
  {
    domain: 'kuyhost.biz.id',
    vercelToken: 'lwjJrMobE4TGmgsuUKEuG9pm',
    cloudflareToken: '54F9_KMSuYX5g8Qm5mteDBdO4xHMIBqjIdSdSij_',
    cloudflareZoneId: '82b50730b4953949cab7ff7e574b1778'
  },
  {
    domain: 'goodsite.my.id',
    vercelToken: 'YYqQ42r5aZgH4NoipzRgNfSp',
    cloudflareToken: 'ReDjqj4w1YFz--isQOa9jrLBoRKXyWbgwr5I2qA2',
    cloudflareZoneId: '4604b3a245ea3fed1567d4565de4b510'
  }
];
const randomUid = () => {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

const app = express();
const PORT = 3000;

app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: '100mb' }));


app.post('/mdfup', async (req, res) => {
  const { apikey, filename, buffer } = req.body;

  if (!buffer || !filename) {
    return res.status(400).json({ success: false, message: 'Harus ada buffer dan filename' });
  }

  try {
    const fileBuffer = Buffer.from(buffer, 'base64');

    const form = new FormData();
    form.append('file', fileBuffer, filename);

    await axios.post(
      `https://www.mediafire.com/api/1.5/upload/simple.php?session_token=${MEDIAFIRE_SESSION_TOKEN}`,
      form,
      { headers: form.getHeaders() }
    );

    const { data } = await axios.post(
      'https://www.mediafire.com/api/1.5/folder/get_content.php',
      null,
      {
        params: {
          session_token: MEDIAFIRE_SESSION_TOKEN,
          folder_key: 'myfiles',
          content_type: 'files',
          response_format: 'json'
        }
      }
    );

    const files = data?.response?.folder_content?.files;
    const lastFile = files?.[0];
    const link = lastFile?.links?.normal_download;

    if (!link) {
      return res.status(500).json({ success: false, message: 'Gagal ambil URL file' });
    }

    return res.json({ success: true, url: link });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, message: 'Upload gagal', error: err.message });
  }
});

app.get("/bugilin", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.json({ 
            success: false, 
            message: "Isi parameter URL gambar dengan query ?url=" 
        });
    }

    try {
        const apiUrl = `https://goodplay.xyz/bugilin.php?apikey=bagus&url=${encodeURIComponent(url)}`;
        console.log("Requesting:", apiUrl); // DEBUG

        const response = await axios.get(apiUrl);
        console.log("Respons:", response.data); // DEBUG

        const result = response.data;

        if (!result || !result.success || !result.result) {
            return res.json({ 
                success: false, 
                message: "Gagal mengambil data",
                raw: result // biar keliatan respon aslinya
            });
        }

        return res.json({
            success: true,
            creator: "Bagus Bahril",
            result: result.result
        });

    } catch (error) {
        console.error("Error /bugilin:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan server", 
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada http://localhost:${PORT}`);
});
