import { PageConfig } from '@jupyterlab/coreutils'
import { IStateDB } from '@jupyterlab/statedb';
import { INotification } from 'jupyterlab_toastify';
import { popupResultText } from './widgets';
import { getUserInfo } from "./getKeycloak";
import { request, RequestResult } from './request';

let ade_server = '';
var valuesUrl = new URL(PageConfig.getBaseUrl() + 'maapsec/environment');

request('get', valuesUrl.href).then((res: RequestResult) => {
  if (res.ok) {
    let environment = JSON.parse(res.data);
    ade_server = environment['ade_server'];
  }
});

export async function getUsernameToken(state: IStateDB, profileId:string, callback) {
  let uname:string = 'anonymous';
  let ticket:string = '';

  if ("https://" + ade_server === document.location.origin) {
    getUserInfo(function(profile: any) {
      if (profile['cas:username'] === undefined) {
        INotification.error("Get profile failed.");
      } else {
        uname = profile['cas:username'];
        ticket = profile['proxyGrantingTicket'];
        callback(uname,ticket);
        INotification.success("Got profile.");
      }
    });
  } else {
    state.fetch(profileId).then((profile) => {
      let profileObj = JSON.parse(JSON.stringify(profile));
      INotification.success("Got profile.");
      uname = profileObj.preferred_username;
      ticket = profileObj.proxyGrantingTicket;
      callback(uname,ticket);
    }).catch((error) => {
      INotification.error("Get profile failed.");
    });
  }
}

export async function getAlgorithms(state: IStateDB, ticket?:string) {

  return new Promise<{[k:string]:Array<string>}>((resolve, reject) => {
    var algoSet: { [key: string]: Array<string>} = {}

    // get list of projects to give dropdown menu
    var settingsAPIUrl = new URL(PageConfig.getBaseUrl() + 'hysds/listAlgorithms');
    if (! ticket === undefined) {
      settingsAPIUrl.searchParams.append('proxy-ticket',ticket);
    }
    console.log(settingsAPIUrl.href);
    request('get',settingsAPIUrl.href).then((res: RequestResult) => {
      if (res.ok) {
        var json_response:any = res.json();
        var algos = json_response['algo_set'];
        // console.log(json_response);
        // console.log(algos);
        algoSet = algos;
        resolve(algoSet);
      }
    });
  });
}

export async function getDefaultValues(code_path) {

  return new Promise<{[k:string]:string}>((resolve, reject) => {
    var defaultValues:{[k:string]:string}  = {}

    // get list of projects to give dropdown menu
    var valuesUrl = new URL(PageConfig.getBaseUrl() + 'hysds/defaultValues');
    valuesUrl.searchParams.append('code_path', code_path);
    console.log(valuesUrl.href);
    request('get',valuesUrl.href).then((res: RequestResult) => {
      if (res.ok) {
        var json_response:any = res.json();
        var values = json_response['default_values'];
        defaultValues = values;
      resolve(defaultValues);
      } else {
        resolve({});
      }
    });
  });
}

// HySDS endpoints that require inputs
export async function inputRequest(state: IStateDB, endpt:string,title:string,inputs:{[k:string]:string},fn?:any) {
  var requestUrl = new URL(PageConfig.getBaseUrl() + 'hysds/' + endpt);
  // add params
  console.log(inputs);
  for (let key in inputs) {
    var fieldValue = inputs[key];
    // if(key !== 'proxy-ticket')
    //   fieldValue = fieldValue.toLowerCase();
    requestUrl.searchParams.append(key.toLowerCase(), fieldValue);
  }
  console.log(requestUrl.href);

  // send request
  request('get',requestUrl.href).then((res: RequestResult) => {
    if (res.ok) {
      var json_response:any = res.json();
      // console.log(json_response['result']);
      // console.log(fn);
      if (fn == undefined) {
        console.log('fn undefined');
        if (endpt === 'listJobs') {
            popupResultText(Object.keys(json_response['jobs']).join('<br>'),title);
        } else {
            popupResultText(json_response['result'],title);
        }
      } else {
        console.log('fn defined');
        fn(json_response);
      }
    } else {
      var json_response:any = res.json();
      INotification.error(json_response['result']);
    }
  }); 
}

// HySDS endpoints that don't require any inputs
export function noInputRequest(state: IStateDB, endpt:string,title:string) {
    inputRequest(state, endpt,title,{});
}

export async function algorithmExists(state: IStateDB, name:string,ver:string,env:string,ticket:string) {
    var requestUrl = new URL(PageConfig.getBaseUrl() + 'hysds/' + 'describeProcess');
    // add params
    requestUrl.searchParams.append('algo_id', name+'_'+env);
    requestUrl.searchParams.append('version', ver);
    requestUrl.searchParams.append('proxy-ticket', ticket);
    console.log(requestUrl.href);

    // send request
    return request('get',requestUrl.href).then((res: RequestResult) => {
        if (res.ok) {
            var json_response:any = res.json();
            console.log(json_response);
            if (json_response.status == 200) {
                return true;
            } else {
                return false;
            }
        } else {
            console.log('describeProcess not ok');
            return false;
        }
    }); 
}

