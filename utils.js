const psTree = require("ps-tree")
const {spawn } = require('child_process')
const {child_process_status_ok}  = require("./taskstatus")
const {process_ok_clean_timer__status}  = require("./metrics")
/**
 * 
 * @param {mainProcessID} mainProcessID 
 * @param {cb}  callback for check status
 */
function stopProcess(mainProcessID,cb){
    psTree(mainProcessID, function (err, children) {
        if (err){
          process_ok_clean_timer__status.set(0)
        }
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
        cb(null,"ok")
      })
}
module.exports = {
    stopProcess
};