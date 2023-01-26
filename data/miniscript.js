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
const BaseURL = "http://a4d0ee6d7af0e41b08a48d65059fe5c2-107451142.us-west-2.elb.amazonaws.com:8080";
//const BaseURL = "http://localhost:8080";
let login_duration_trend = new Trend('login_duration_trend', true);
let get_book_duration_trend = new Trend('get_book_duration_trend', true);


let login_counter = new Counter('login_counter');
let get_book_counter = new Counter('get_book_counter');


const AuthedUsers = [{ "name": "vahid4m", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTUxNjUyY2U4OTVjODAwMThjNjBjNzYiLCJpYXQiOjE1ODczMTI3Nzh9.OGyfN_ebSc8drinBIjW15jJKDAgvzDDyh-y3dtkTSVw" }];
const books = [{ "_id": "5e5218426a4cea0021cdbf9a" }];

function get_random_item(items) {
  const item = items[Math.floor(Math.random() * items.length)];
  return item
}
export function execute_get_book() {
  const auth_token = get_random_item(AuthedUsers)['token'];
  const book = get_random_item(books);
  let get_book_params = {
    headers: {
      'Authorization': 'Bearer ' + auth_token,
      'debug_id': new Date().getTime()
    },
    tags: {
      name: "get_book"
    }
  };
  let get_book_response = http.get(
    BaseURL + '/books/' + book._id,
    get_book_params
  );
  get_book_duration_trend.add(get_book_response.timings.duration);
  get_book_counter.add(1);
  check(get_book_response, {
    'is_get_book_200': r => r.status === 200,
    'is id present': r => r.json().hasOwnProperty('_id')
  });
}
export function execute_random_login() {
  const name = get_random_item(AuthedUsers)['name']
  const email = name + "@gmail.com";
  const password = "123456789";


  let body = JSON.stringify({
    email: email,
    password: password,
  });


  let login_params = {
    headers: {
      'Content-Type': 'application/json',
      'debug_id': new Date().getTime(),
    },
    tags: {
      name: "login"
    }
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
    'is api key present': r => r.json().hasOwnProperty('token'),
  });
  AuthedUsers.push({ name, "token": login_response.json()["token"] })
}