import Net from './helpers/net.js'
import Template from './Components/Template.jsx'
import Dashboard from './Components/Dashboard.jsx'
import Alerts from './Components/Alerts.jsx'
import Login from './Components/Login.jsx'
import Users from './Components/Users.jsx'
import Campaigns from './Components/Campaigns.jsx'
import MapView from './Components/MapView.jsx'

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
  name : 'home.alerts',
  url  : '/alerts',
  component: Alerts,
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
},
{
  name : 'home.campaigns',
  url  : '/campaigns',
  component: Campaigns
},
{
  name : 'home.map',
  url  : '/map',
  component: MapView
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