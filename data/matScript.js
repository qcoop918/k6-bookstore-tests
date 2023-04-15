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

const BaseURL = "http://136.159.209.203";
let get_bogo_duration_trend = new Trend('get_bogo_duration_trend', true);
let get_write_duration_trend = new Trend('get_write_duration_trend', true);


let get_bogo_counter = new Counter('bogo_counter');
let get_write_counter = new Counter('write_counter');

function get_random_item(items) {
    const item = items[Math.floor(Math.random() * items.length)];
    return item
}
export function execute_get_write() {
    let get_write_params = {
        headers: {
            'Authorization' : '123' 
        }
    }
    let get_write_response = http.post(
        BaseURL + ':8080/writeReadDelete',
        get_write_params
    );
    get_write_duration_trend.add(get_write_response.timings.duration);
    get_write_counter.add(1);
    check(get_write_response, {
        'is_write_200': r => r.status === 200,
    });
}
export function execute_get_bogo() {
    let bogo_params = {
        headers: {
            'Authorization' : '123' 
        },
    };

    let get_bogo_response = http.post(
        BaseURL + ':8080/bogo',
        bogo_params
    );
    get_bogo_duration_trend.add(get_bogo_response.timings.duration);
    get_bogo_counter.add(1);
    check(get_bogo_response, {
        'is_bogo_200': r => r.status === 200,
    });
}