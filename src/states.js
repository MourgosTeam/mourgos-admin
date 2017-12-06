import Net from './helpers/net.js'
import Template from './Components/Template.jsx'
import Dashboard from './Components/Dashboard.jsx'
import Login from './Components/Login.jsx'
import Users from './Components/Users.jsx'

export default [
{
  name : "login",
  url  : "/login",
  component: Login,
  resolve : [{
    token : 'hasCreds',
    deps  : ['$transition$'],
    resolveFn : (trans) => {
      const stateService = trans.router.stateService;
      let token = Net.getToken();
      if(token !== false){
        stateService.go('home.dashboard');
        return Promise.reject("I have token");
      }
      return Promise.resolve(true);
    }
  }]
},
{
  name : "home",
  url  : "/home",
  component: Template
},
{
  name : 'home.dashboard',
  url  : '/dashboard',
  component: Dashboard,
  resolve : [{
    token : 'socket',
    deps  : ['$transition$'],
    resolveFn : (trans) => {
      return Promise.resolve(Net.Socket);
    }
  }]
},
{
  name : 'home.users',
  url  : '/users',
  component: Users
}
// {
//     token: "catalogue",
//     deps : ['$transition$'],
//     resolveFn : (trans) =>{
//       var curl = trans.params().catalogueURL;
//       return GetIt("/catalogues/"+curl , "GET")
//       .then(function(data){
//         return data.json();
//       })
//     }
//}
];