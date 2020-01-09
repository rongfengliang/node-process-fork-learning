const { fork } = require('child_process')
const express = require("express")
const util = require("./utils")
const { child_process_status_all, child_process_status_pending, child_process_status_ok } = require("./taskstatus")
const { child_process_status_all_counter, child_process_status_pending_gauge, child_process_status_ok_counter, initMetrics, initGcStats, process_ok_clean_timer__status, up } = require("./metrics")
const app = express();
const main_process_id = process.pid;
let interval = false;

/**
 * metrics route register
 */
app.get('/metrics', (req, res) => {
  initMetrics(req, res);
})
/**
 * disable process clean timer 
 */
app.get("/disable_timer", (req, res) => {
  if (interval) {
    interval = false;
  }
  process_ok_clean_timer__status.set(0)
  res.send({ timer_statuss: false })
})
/**
 * enable process clean timer 
 */
app.get("/enable_timer", (req, res) => {
  if (interval == false) {
    interval = true;
  }
  process_ok_clean_timer__status.set(1)
  res.send({ timer_statuss: true })
})

/**
 * for create process workers
 */
app.get('/endpoint', (req, res) => {
  // fork another process
  const myprocess = fork('./send_mail.js');
  child_process_status_pending[myprocess.pid] = {
    status: "pending"
  }
  child_process_status_all[myprocess.pid] = {
    status: "pending"
  }
  child_process_status_all_counter.inc(1)
  child_process_status_pending_gauge.inc(1)
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
    child_process_status_ok_counter.inc(1)
    child_process_status_pending_gauge.dec(1)
    child_process_status_all[myprocess.pid] = {
      status: "ok"
    }
    delete child_process_status_pending[myprocess.pid]
  });
  return res.json({ status: true, sent: true });
});

/**
 * call api for stop processed workers
 */
app.get("/stop", (req, res) => {
  util.stopProcess(main_process_id, (err, data) => {
    if (err == null) {
      res.send({ timer_clean_status: "ok" })
    }
  })
})

// init gc metrics 
initGcStats()
// clean ok process timer
setInterval(function () {
  if (interval) {
    util.stopProcess(main_process_id, (err, data) => {
      if (err == null) {
        console.log({ timer_clean_status: "ok" })
      } else {
        process_ok_clean_timer__status.set(0)
      }
    })
  }
}, 10000)
// set metric status to up 
up.set(1)
app.listen(8080, "0.0.0.0", () => {
  console.log(`go to http://localhost:8080/ to generate traffic`)
}).on("error", () => {
  up.set(0)
})
