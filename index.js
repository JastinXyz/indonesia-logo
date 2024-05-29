import fs from "fs";
import { parse } from "node-html-parser";
import axios from "axios";

let HOST = "https://id.wikipedia.org";
const URL = `${HOST}/wiki/Daftar_kabupaten_dan_kota_di_Indonesia`;

let provinceList = [];
let provinceNow = 0;
let cityList = [];
let outputData = [];

let getProvinces = fs.readFileSync("./data/provinces.json", 'utf-8');
let provinces = JSON.parse(getProvinces);

let getCities = fs.readFileSync("./data/cities.json", 'utf-8');
let cities = JSON.parse(getCities);

if(!fs.existsSync('./images')) {
    fs.mkdirSync('images')
}

function ext(url) {
    return url.split(/[#?]/)[0].split('.').pop().trim().toLowerCase();
}

function getProvinceCodeByName(name) {
    if(!name) return null;

    let province = provinces.find(x => x.name.toLowerCase() === name.replace("Daerah Khusus Ibukota", "DKI").toLowerCase());
    return province ? province.code : null;
}

function getCityCodeByName(name) {
    if(!name) return null;

    let city = cities.find(
        (x) =>
            x.name.toLowerCase() ===
            name
                .replace("Tanjungbalai", "Tanjung Balai")
                .replace("Pagaralam", "Pagar Alam")
                .replace("Mukomuko", "Muko Muko")
                .replace("Pangkalpinang", "Pangkal Pinang")
                .replace("Tanjungpinang", "Tanjung Pinang")
                .replace("Administrasi Kepulauan", "ADM. KEP.")
                .replace("Administrasi", "ADM.")
                .replace("Kabupaten Timor Tengah Selatan", "Kab Timor Tengah Selatan")
                .replace("Palangka Raya", "Palangkaraya")
                .replace("Una-Una", "Una Una")
                .replace("Tolitoli", "Toli Toli")
                .replace("Pangkajene dan Kepulauan", "Pangkajene Kepulauan")
                .replace("Parepare", "Pare Pare")
                .replace("Baubau", "Bau Bau")
                .replace("Fakfak", "Fak Fak")
                .toLowerCase()
    );

    return city ? city.code : null;
}

axios.get(URL).then((response) => {
    let document = parse(response.data);

    document.querySelectorAll("h3 > span.mw-headline").forEach((m, idm) => {
        provinceList.push(m.textContent)
    });

    document.querySelectorAll("table.wikitable.sortable").forEach((x, idx) => {
        if (idx === 0) return;

        x.querySelectorAll("tbody > tr:nth-child(1)").forEach(async(m, idm) => {
            let name = provinceList[provinceNow];
            let code = getProvinceCodeByName(name);

            if(code) {
                axios.get(HOST + m.querySelector("th:nth-child(9) > figure > a").getAttribute("href")).then((x) => {
                    let berkasDoc = parse(x.data);
                    let pngUrl = berkasDoc.querySelector("#file > div > span > a:last-child").getAttribute("href");
                    axios.get("https:" + pngUrl, { responseType: 'arraybuffer' })
                        .then((response) => {
                            fs.writeFileSync(`./images/${code}.png`, response.data);
                            outputData.push({ code, path: `/images/${code}.png` });
                            console.log(`[PROVINCE] [${code}] ${name} done.`);
                        })
                        .catch((error) => {
                            console.error('Error downloading PNG file:', error.message);
                        });
                })
            }

            provinceNow++
        });

        x.querySelectorAll("tbody > tr").forEach((m, idm) => {
            if(idm === 0) return;

            let name;
            m.querySelectorAll("td").forEach((j, idj) => {
                if(idj === 1) {
                    name = j.querySelector("a").textContent;
                }

                if(idj === 8) {
                    let cityCode = getCityCodeByName(name);

                    let ahref = j.querySelector("figure > a");

                    if(cityCode && ahref) {
                        cityList.push({ name, code: cityCode, url: ahref.getAttribute("href") });
                    }
                }
            })
        })
    });    
}).then(() => {
    const downloadCityLogo = (idx) => {
        let city = cityList[idx];

        if(city) {
            axios.get(HOST + city.url).then((x) => {
                let berkasDoc = parse(x.data);
                let pngEl = berkasDoc.querySelector("#file > div > span > a:last-child");
                if(!pngEl) pngEl = berkasDoc.querySelector("#mw-content-text > div.mw-content-ltr.fullMedia > p > a");

                let pngUrl = pngEl.getAttribute("href")
                axios.get("https:" + pngUrl, { responseType: 'arraybuffer' })
                    .then((response) => {
                        fs.writeFileSync(`./images/${city.code}.${ext(pngUrl)}`, response.data);
                        outputData.push({ code: city.code, path: `/images/${city.code}.${ext(pngUrl)}` });
                        console.log(`[CITY] [${city.code}] ${city.name} done.`);

                        downloadCityLogo(idx + 1);
                    })
                    .catch((error) => {
                        console.error('Error downloading PNG file:', error.message);
                    });
            })
        } else {
            fs.writeFileSync('./data/output.json', JSON.stringify(outputData));
            return;
        }
    }

    downloadCityLogo(0);
})