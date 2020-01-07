const { fork, spawn } = require('child_process');
const express = require("express")
const psTree = require("ps-tree")
app = express();
var main_process_id = process.pid;
console.log(`main process id ${main_process_id}`)
var child_process_status = {};
var child_process_status_all = {};
var child_process_status_pending = {};
var child_process_status_ok = {};
app.get('/endpoint', (request, response) => {
  // fork another process
  const myprocess = fork('./send_mail.js');
  child_process_status_pending[myprocess.pid] = {
    status: "pending"
  }
  child_process_status_all[myprocess.pid] = {
    status: "pending"
  }
  console.log(`fork process pid:${myprocess.pid}`)
  const mails = "dddd";
  // send list of e-mails to forked process
  myprocess.send({ mails });
  // listen for messages from forked process
  myprocess.on('message', (message) => {
    console.log(`Number of mails sent ${message.counter}`);
    child_process_status_ok[myprocess.pid] = {
      status: "ok"
    }
    child_process_status_all[myprocess.pid] = {
      status: "ok"
    }
    delete child_process_status_pending[myprocess.pid]
  });
  return response.json({ status: true, sent: true });
});
setInterval(() => {
  psTree(main_process_id, function (err, children) {
    console.log(`all:${JSON.stringify(child_process_status_all)}`)
    console.log(`ok: ${JSON.stringify(child_process_status_ok)}`)
    console.log(`pending:${JSON.stringify(child_process_status_pending)}`)
    let pids = [];
    for (const key in child_process_status_ok) {
      if (child_process_status_ok.hasOwnProperty(key)) {
        pids.push(key)
        delete child_process_status_ok[key]
      }
    }
    let info = children.filter(item => item.COMM == "ps" || item.COMMAND == "ps").map(function (p) { return p.PID })
    pids.push(...info)
    console.log(`stop  child process ids: ${JSON.stringify(pids)}`)
    spawn('kill', ['-9'].concat(pids));
    console.log({ stop: true });
  })
},2000)
// for stop fork  child process 
app.get("/stop", (request, response) => {
  psTree(main_process_id, function (err, children) {
    console.log(`all:${JSON.stringify(child_process_status_all)}`)
    console.log(`ok: ${JSON.stringify(child_process_status_ok)}`)
    console.log(`pending:${JSON.stringify(child_process_status_pending)}`)
    let pids = [];
    for (const key in child_process_status_ok) {
      if (child_process_status_ok.hasOwnProperty(key)) {
        pids.push(key)
        delete child_process_status_ok[key]
      }
    }
    let info = children.filter(item => item.COMM == "ps" || item.COMMAND == "ps").map(function (p) { return p.PID })
    pids.push(...info)
    console.log(`stop  child process ids: ${JSON.stringify(pids)}`)
    spawn('kill', ['-9'].concat(pids));
    return response.json({ stop: true });
  })
})
app.listen(8080, "0.0.0.0", () => {
  console.log(`go to http://localhost:8080/ to generate traffic`)
});