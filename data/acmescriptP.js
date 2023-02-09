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
const BaseURL = "http://172.31.15.21";
let login_duration_trend = new Trend('login_duration_trend', true);
let get_book_duration_trend = new Trend('get_flights_duration_trend', true);


let login_counter = new Counter('login_counter');
let get_book_counter = new Counter('get_book_counter');


const AuthedUsers = [{ "login": "uid0@email.com", "password": "password" }];
const flights = [{ "fromAirport": "CDR", "toAirport": "LHR", "fromDate": "Wed Feb 01 2023 00:00:00 GMT-0700 (Mountain Standard Time)", "returnDate": "Wed Feb 01 2023 00:00:00 GMT-0700 (Mountain Standard Time)", "oneWay": false }];

function get_random_item(items) {
    const item = items[Math.floor(Math.random() * items.length)];
    return item
}
export function execute_get_book() {
    const flight = get_random_item(flights)
    let get_book_params = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };
    
    let body = Object.keys(flight).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(flight[key])).join('&');
    let get_book_response = http.post(
        BaseURL + '/flight/queryflights',
        body,
        get_book_params
    );
    get_book_duration_trend.add(get_book_response.timings.duration);
    get_book_counter.add(1);
    check(get_book_response, {
        'is_get_book_200': r => r.status === 200,
        'is flight present': r => r.json().hasOwnProperty('tripFlights')
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