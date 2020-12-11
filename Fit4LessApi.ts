import { CLUBS } from "./clubs";
const nodeFetch = require("node-fetch");
const fetch = require("fetch-cookie/node-fetch")(nodeFetch);

const HTMLParser = require('node-html-parser');

const LOGIN_URL = "https://myfit4less.gymmanager.com/portal/login_done.asp";
const SUBMIT_URL = "https://myfit4less.gymmanager.com/portal/booking/submit.asp";
const MENU_URL = "https://myfit4less.gymmanager.com/portal/booking/index.asp";

export interface IConfig {
    email: string;
    pw: string;
    time: string;
    club?: string;
}

export interface ISession {
    id: string;
    name?: string;
}

export class Fit4LessApi {
    private id: Number;
    private config: IConfig;

    constructor(config: IConfig) {
        this.config = config;
    }
    initialize() {
        const form = new URLSearchParams();

        form.append("emailaddress", this.config.email);
        form.append("password", this.config.pw);

        return fetch(LOGIN_URL, {
            method:"POST", 
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: form,
            }).then(res=>res.text()).then((response) => {
                const startIndex = response.indexOf("?id=") + 4;
                const endIndex = response.indexOf("'<");
        
                this.id =  new Number(response.substring(startIndex, endIndex));
                return true;
            }).catch(e => false);
    }

    submitForm(form) {
        return fetch(SUBMIT_URL, {
                        method:"POST", 
                        headers: {"Content-Type": "application/x-www-form-urlencoded"},
                        body: form,
                        });
    }

    setClub() {
        const form = new URLSearchParams();

        const club = this.config.club && {
            id: Object.keys(CLUBS)[Object.values(CLUBS).indexOf(this.config.club)],
            name: this.config.club
        }
    
        form.append("action", "clubchange");
        form.append("block_id", club.id);
        form.append("block_name", club.name);
    
    
        return this.submitForm(form).then(response => response.status === 302);
        
    }

    formatDateAndIncrement(date) {
        date.setDate(date.getDate() + 1);
        return date.toISOString().slice(0,10);
    }

    setDate() {
        const form = new URLSearchParams();
        const date = this.formatDateAndIncrement(new Date());
        
        form.append("action", "daychange");
        form.append("block_id", date);
        form.append("block_name", "");
    
    
        return this.submitForm(form);
    }

    parseOptions(menu) {
        return HTMLParser.parse(menu).querySelectorAll(".available-slots")[1].childNodes.map(node => node.rawAttrs).filter(Boolean);
    }

    fetchMenu() {
        return fetch(this.id ? `${MENU_URL}?id=${this.id}` : MENU_URL, {
            method: "GET",
        }).then(res=>res.text()).catch(e=>"something went wrong");
    }

    parseSession(s: string): ISession {
        return {
            id: s.substring(9, 45),
        };
    }

    bookSession(session: ISession) {
        const form = new URLSearchParams();
       
        form.append("action", "booking");
        form.append("block_id", session.id);
        form.append("block_name", session.name);
    
    
        return this.submitForm(form);
    }

}