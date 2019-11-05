import { Widget, Panel } from '@phosphor/widgets';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils'
import { INotification } from "jupyterlab_toastify";
import { getUserInfo } from "./getKeycloak";
import { request, RequestResult } from './request';
import {  } from "./dialogs";

const CONTENT_CLASS = 'jp-Inspector-content';
// primitive text panel for storing submitted job information
export class JobCache extends Panel {
  public opt:string;
  table: string;
  displays: {[k:string]:string};
  results: string;
  jobs: {[k:string]:string};
  job_id: string;
  username: string;

  constructor() {
    super();

    // set username on start
    // callback should finish before users manage to do anything
    // now profile timing out shouldn't be a problem
    let me = this;
    getUserInfo(function(profile: any) {
      if (profile['cas:username'] === undefined) {
        INotification.error("Get username failed.");
        me.username = 'anonymous';
      } else {
        me.username = profile['cas:username'];
        INotification.success("Got username.");
      }
    });

    this.table = '';
    this.results = '';
    this.displays = {};
    this.jobs = {};
    this.job_id = '';
    this.addClass(CONTENT_CLASS);
  }

  updateDisplay(): void {
    var x = document.createElement("BR");
    this.node.appendChild(x);

    // call list jobs endpoint using username
    var getUrl = new URL(PageConfig.getBaseUrl() + 'hysds/listJobs');
    getUrl.searchParams.append('username',this.username);
    console.log(getUrl.href);
    // --------------------
    // get jobs list request
    // --------------------
    request('get', getUrl.href).then((res: RequestResult) => {
      if(res.ok){
        let json_response:any = res.json();
        // console.log(json_response['status_code']);
        INotification.success("Get user jobs success.");
        // console.log(json_response['result']);
        // console.log(json_response['displays']);

        if (json_response['status_code'] == 200){
          this.table = json_response['table'];
          this.jobs = json_response['jobs'];
          // later get user to pick the job
          this.displays = json_response['displays'];

          // catch case if user has no jobs
          let num_jobs = Object.keys(this.jobs).length;
          if (num_jobs > 0 && this.job_id == '') {

            this.job_id = json_response['result'][0]['job_id'];
          }

        } else {
          console.log('unable to get user job list');
          INotification.error("Get user jobs failed.");
        }
      } else {
        console.log('unable to get user job list');
        INotification.error("Get user jobs failed.");
      }
    });

    console.log('got table, setting panel display');
    this.getJobInfo();
  }

  // front-end side of display jobs table and job info
  getJobInfo() {
    // --------------------
    // job table
    // --------------------
    // set table, from response
    let me = this;
    if (document.getElementById('job-cache-display') != null) {
      (<HTMLTextAreaElement>document.getElementById('job-cache-display')).innerHTML = me.table;
    } else {
      // create div for table if table doesn't already exist
      var div = document.createElement('div');
      div.setAttribute('id', 'job-table');
      div.setAttribute('resize','none');
      div.setAttribute('class','jp-JSONEditor-host');
      div.setAttribute('style','border-style:none;');

      // jobs table
      var textarea = document.createElement("table");
      textarea.id = 'job-cache-display';
      textarea.innerHTML = me.table;
      textarea.className = 'jp-JSONEditor-host';
      div.appendChild(textarea);
      me.node.appendChild(div);
    }

    // --------------------
    // refresh button
    // --------------------
    if (document.getElementById('job-refresh-button') == null) {
      let div = (<HTMLDivElement>document.getElementById('jobs-div'));
      let refreshBtn = document.createElement('button');
      refreshBtn.id = 'job-refresh-button';
      refreshBtn.className = 'jupyter-button';
      refreshBtn.innerHTML = 'Refresh Job List';
      refreshBtn.addEventListener('click', function() {me.updateDisplay()}, false);
      let br = document.createElement('br');
      div.appendChild(br);
      div.appendChild(refreshBtn);
    }

    // set display in 2nd callback after making table rows clickable
    let setDisplays = function (me:JobCache){
      // create div for job info section
      // parent for everything, created in table response
      if (document.getElementById('jobs-div') != null) {
        // 1-time add line break and section header for job info
        let div2 = (<HTMLDivElement>document.getElementById('jobs-div'));
        if (document.getElementById('job-info-head') == null) {
          // line break
          var line = document.createElement('hr');
          div2.appendChild(line);
  
          // display header
          var detailHeader = document.createElement('h4');
          detailHeader.setAttribute('id','job-info-head');
          detailHeader.setAttribute('style','margin:0px');
          detailHeader.innerText = 'Job Information';
          div2.appendChild(detailHeader);
        }
  
        // --------------------
        // job info
        // --------------------
        // set description from response
        let disp = '';
        if (me.job_id != ''){
          disp = me.displays[me.job_id];
        }

        if (document.getElementById('job-detail-display') != null) {
          // console.log(me.job_id);
          (<HTMLTextAreaElement>document.getElementById('job-detail-display')).innerHTML = disp;
        } else {
          // create textarea if it doesn't already exist
          // detailed info on one job
          var display = document.createElement("textarea");
          display.id = 'job-detail-display';
          (<HTMLTextAreaElement>display).readOnly = true;
          (<HTMLTextAreaElement>display).cols = 30;
          (<HTMLTextAreaElement>display).innerHTML = disp;
          display.setAttribute('style', 'margin: 0px; height:19%; width: 98%; border: none; resize: none');
          display.className = 'jp-JSONEditor-host';
          div2.appendChild(display);

          // create button to delete job 
          if (document.getElementById('job-delete-button') == null){
            var deleteBtn = document.createElement("button");
            deleteBtn.id = 'job-delete-button';
            deleteBtn.className = 'jupyter-button';
            deleteBtn.innerHTML = 'Delete Job';
            // change to get job_id and delete via widget or send request & create own popup
            deleteBtn.addEventListener('click', function () {
              var getUrl = new URL(PageConfig.getBaseUrl() + 'hysds/delete');
              getUrl.searchParams.append('job_id', me.job_id);
              console.log(getUrl.href);
              request('get',getUrl.href).then((res: RequestResult) => {
                if (res.ok) {
                  let json_response:any = res.json();
                  let result = json_response['result'];

                  let body = document.createElement('div');
                  body.style.display = 'flex';
                  body.style.flexDirection = 'column';

                  let textarea = document.createElement("div");
                  textarea.id = 'delete-button-text';
                  textarea.style.display = 'flex';
                  textarea.style.flexDirection = 'column';
                  textarea.innerHTML = "<pre>"+result+"</pre>";

                  body.appendChild(textarea);
                  showDialog({
                    title: 'Delete Job',
                    body: new Widget({node:body}),
                    focusNodeSelector: 'input',
                    buttons: [Dialog.okButton({label: 'Ok'})]
                  });
                }
              });
            }, false);
            div2.appendChild(deleteBtn);
          }

          // create button to dismiss job
          if (document.getElementById('job-dismiss-button') == null){
            var dismissBtn = document.createElement("button");
            dismissBtn.id = 'job-dismiss-button';
            dismissBtn.className = 'jupyter-button';
            dismissBtn.innerHTML = 'Dismiss Job';
            // change to get job_id and dismiss via widget or send request & create own popup
            dismissBtn.addEventListener('click', function () {
              var getUrl = new URL(PageConfig.getBaseUrl() + 'hysds/dismiss');
              getUrl.searchParams.append('job_id', me.job_id);
              console.log(getUrl.href);
              request('get',getUrl.href).then((res: RequestResult) => {
                if (res.ok) {
                  let json_response:any = res.json();
                  let result = json_response['result'];

                  let body = document.createElement('div');
                  body.style.display = 'flex';
                  body.style.flexDirection = 'column';

                  let textarea = document.createElement("div");
                  textarea.id = 'dismiss-button-text';
                  textarea.style.display = 'flex';
                  textarea.style.flexDirection = 'column';
                  textarea.innerHTML = "<pre>"+result+"</pre>";

                  body.appendChild(textarea);
                  showDialog({
                    title: 'Dismiss Job',
                    body: new Widget({node:body}),
                    focusNodeSelector: 'input',
                    buttons: [Dialog.okButton({label: 'Ok'})]
                  });
                }
              });
            }, false);

            let body2 = document.createElement('span');
            body2.innerHTML = "     ";
            div2.appendChild(body2);
            div2.appendChild(dismissBtn);
          }
        }
  
        // --------------------
        // results button
        // --------------------
        // if (document.getElementById('job-result-button') == null) {
        //   let resultBtn = document.createElement('button');
        //   resultBtn.id = 'job-result-button';
        //   resultBtn.className = 'jupyter-button';
        //   resultBtn.innerHTML = 'Get Job Results';
        //   resultBtn.addEventListener('click', function() {me.getJobResult(me)}, false);
        //   div2.appendChild(resultBtn);
        // }
      }
    }

    // make clickable table rows after setting job table
    this.onRowClick('job-cache-display', function(row){
      let job_id = row.getElementsByTagName('td')[0].innerHTML;
      // document.getElementById('click-response').innerHTML = job_id;
      me.job_id = job_id;
    }, setDisplays);

  }

  // clickable table rows helper function
  onRowClick(tableId, setJobId, setDisplays) {
    let me = this;
    let table = document.getElementById(tableId),
      rows = table.getElementsByTagName('tr'),
      i;
    for (i = 1; i < rows.length; i++) {
      rows[i].onclick = function(row) {
        return function() {
          setJobId(row);
          setDisplays(me);
          me.getJobResult(me);
        }
      }(rows[i]);
    }
    this.results = '';
  }

  // get job result for display
  getJobResult(me:JobCache) {
    var resultUrl = new URL(PageConfig.getBaseUrl() + 'hysds/getResult');
    // console.log(me.jobs[me.job_id]);
    if (me.job_id != '' && me.jobs[me.job_id]['status'] == 'job-completed') {
      resultUrl.searchParams.append('job_id',me.job_id);
      console.log(resultUrl.href);

      request('get', resultUrl.href).then((res: RequestResult) => {
        if(res.ok){
          let json_response:any = res.json();
          // console.log(json_response['status_code']);
          INotification.success("Get user job result success.");

          if (json_response['status_code'] == 200){
            me.results = json_response['result'];

          } else {
            console.log('unable to get user job list');
            INotification.error("Get user job result failed.");
          }
        } else {
          console.log('unable to get user job list');
          INotification.error("Get user job result failed.");
        }
        this.selectedJobResult(me);
      });
    } else {
      me.results = '<p>Job '+me.job_id+' <br>not complete</p>';
      this.selectedJobResult(me);
    }
  }

  // front-end side of display job result table
  selectedJobResult(me:JobCache) {
    // let jobResult = this.results[this.job_id];
    // console.log(me.results);
    if (document.getElementById('jobs-div') != null) {
      // 1-time add line break and section header for job result
      let div2 = (<HTMLDivElement>document.getElementById('jobs-div'));
      if (document.getElementById('job-result-head') == null) {
        // line break
        var line = document.createElement('hr');
        div2.appendChild(line);

        // display header
        var detailHeader = document.createElement('h4');
        detailHeader.setAttribute('id','job-result-head');
        detailHeader.setAttribute('style','margin:0px');
        detailHeader.innerText = 'Job Results';
        div2.appendChild(detailHeader);
      }

      // --------------------
      // job result
      // --------------------
      // console.log('setting results');
      if (document.getElementById('job-result-display') != null) {
        (<HTMLTextAreaElement>document.getElementById('job-result-display')).innerHTML = me.results;
      } else {
        // create div for table if table doesn't already exist
        var div = document.createElement('div');
        div.setAttribute('id', 'result-table');
        div.setAttribute('resize','none');
        div.setAttribute('class','jp-JSONEditor-host');
        div.setAttribute('style','border-style:none; overflow: auto');

        var display = document.createElement("table");
        display.id = 'job-result-display';
        display.innerHTML = me.results;
        display.setAttribute('class','jp-JSONEditor-host');
        display.setAttribute('style','border-style:none; font-size:11px');
        div.appendChild(display);
        div2.appendChild(div);
      }
    }
  }

  addJob(): void {
    this.updateDisplay();
  }
}