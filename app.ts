import { IConfig, Fit4LessApi } from "./Fit4LessApi";

const fs = require("fs");

const CONFIG: IConfig = loadConfig();

function loadConfig() {
    return JSON.parse(fs.readFileSync("config.json"));
}

function main() {
    const api: Fit4LessApi = new Fit4LessApi(CONFIG);

    api.initialize().then(success => {
        if (success) {
            api.fetchMenu();
            api.setClub();
        
            const menu = api.setDate().then(res => res.text());

            menu.then((html) => {
                const options = api.parseOptions(html);
                const book = api.parseSession(options.find(option => option.indexOf(CONFIG.time) !== -1));

                api.bookSession(book);
            });
        }
    });

    

    // this will always be a list of available timeslots for the farthest ahead day (2 day from today)
    //const timeslots = api.parseOptions(menu);

    //console.log(timeslots);
    
}

main();