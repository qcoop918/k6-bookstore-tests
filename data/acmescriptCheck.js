import http from "k6/http";
import {
    randomSeed
} from "k6";
import {
    check,
    sleep
} from 'k6';
import {
    Trend,
    Counter
} from 'k6/metrics';
let stage1;
let stage2;
// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the csv) will be executed per each VU which also means that there will be a complete copy
//const BaseURL = "http://a4d0ee6d7af0e41b08a48d65059fe5c2-107451142.us-west-2.elb.amazonaws.com:8080";
const BaseURL = "http://54.212.182.100";
let login_duration_trend = new Trend('login_duration_trend', true);
let get_book_duration_trend = new Trend('get_flights_duration_trend', true);


let login_counter = new Counter('login_counter');
let get_book_counter = new Counter('get_book_counter');


const AuthedUsers = [{ "login": "uid0@email.com", "password": "password" }];
const flights = [{ "fromAirport": "CDR", "toAirport": "LHR", "fromDate": "Wed Feb 01 2023 00:00:00 GMT-0700 (Mountain Standard Time)", "returnDate": "Wed Feb 01 2023 00:00:00 GMT-0700 (Mountain Standard Time)", "oneWay": false }];
const cookie = "Bearer=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vYWNtZWFpci1tcyIsImV4cCI6MTY3OTg2MDQ2MiwianRpIjoicW1uSUh1YXJaZUxkR2x6OTQyZ0ZJZyIsImlhdCI6MTY3OTg1Njg2Miwic3ViIjoidWlkMEBlbWFpbC5jb20iLCJ1cG4iOiJ1aWQwQGVtYWlsLmNvbSIsImdyb3VwcyI6WyJ1c2VyIl19.LzjxQs6UKnRH3W832KpJfiiR6mVYKiAjUWVoMLqC9ysrRGEFFYll4V_5TZT3WD9Iu28wd6dsvfFpZzdHCclpMDDAvY1KPq5c29_TZDpqSBOZX5_c17ZpIX-fXSGBmlRjW3pX4nJ0vFBxCefUxPrNMJv_Xd_lEK169KLweSL6FGMBStfCo_N25EMyb6ygkFpjhnRDnQHzaVVnRE6QckrUvvjwAiC00SANcAquvQfdGyD_uRRwINXYcP7DdLb6Dzwpp_vBYiQGcDJD9g_j_3D4UKlcuApR9_wIomjfnjWQQ_UVxVszbtjy_wmJ4lR3gQ40jwTM3tmD08DGhQ51pKoeOw; Path=/; Expires=Mon, 25 Mar 2024 18:58:42 GMT; loggedinuser=uid0@email.com; Path=/; Expires=Mon, 25 Mar 2024 18:59:10 GMT;"

function get_random_item(items) {
    const item = items[Math.floor(Math.random() * items.length)];
    return item
}
export function execute_get_book() {
    const flight = get_random_item(flights)
    let get_book_params = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie,
        },
    };
    
    //let body = Object.keys(flight).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(flight[key])).join('&');
    let get_book_response = http.post(
        BaseURL + '/booking/byuser/uid0@email.com',
        body,
        get_book_params
    );
    get_book_duration_trend.add(get_book_response.timings.duration);
    get_book_counter.add(1);
    check(get_book_response, {
        'is_get_book_200': r => r.status === 200,
        //'is flight present': r => r.json().hasOwnProperty('tripFlights')
    });
}
export function execute_random_login() {
    const auth = get_random_item(AuthedUsers)

    let body = Object.keys(auth).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(auth[key])).join('&');


    let login_params = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
    };

    let login_response = http.post(
        BaseURL + '/auth/login',
        body,
        login_params
    );
    login_duration_trend.add(login_response.timings.duration);
    login_counter.add(1);
    check(login_response, {
        'is_login_200': r => r.status === 200,
        'is logged in': r => r.body.includes("logged in"),
    });
}