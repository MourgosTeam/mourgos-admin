import ioClient from 'socket.io-client'

let Socket = ioClient('http://localhost:3000/?id=all', { path: "/socket.io/" });

const DEBUG = true;
function info(d){
  DEBUG ? console.log(d): false;
}

function getToken(){
  const token = localStorage.getItem('Token');
  if(!token){
    return false;
  }
  return token;
}

function saveToken(token){
  localStorage.setItem('Token', token);
}

function RequestIt(url, method, body, token){
  url = "/api/" + url;
  
  info("Fetching " + url);

  let options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Token" : token
    }
  };
  if (body !== null){
    options.body = JSON.stringify(body);
  }

  return fetch(url, options).then( (response) => {
    if(!response.ok){
      info(response);
      throw new Error(response);
    }
    return response;
  }).catch( (err) => {
    if(err.status && err.status === 403){
      //redirect to login
      alert("You need to login!");
    }
    else throw err;
  });
}

function GetIt(url){
  return RequestIt(url, 'GET');
}

function GetItWithToken(url){
  const token = getToken();
  return RequestIt(url, 'GET', null, token).
         then((response) => response.json());
}

function PostIt(url, body){
  return RequestIt(url, 'POST', body);
}

function PostItWithToken(url, body){
  const token = getToken();
  return RequestIt(url, 'POST', body, token).
         then((response) => response.json());
}

function Login(username, password){
  return PostIt('users/login', { username, password })
  .then((response) => response.json())
  .then((data) => {
    if(data.role!==0)throw Error("Not admin account!");
    return data;
  })
  .then((data) => saveToken(data.token));
}

export default {
  GetIt,
  GetItWithToken,
  getToken,
  PostIt,
  PostItWithToken,
  RequestIt,
  Login,
  Socket
}