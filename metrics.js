const Prometheus = require("prom-client")
const gcStats = require('prometheus-gc-stats')
module.exports = {
    child_process_status_all_counter:new Prometheus.Counter({
        name: 'child_process_status_all_total',
        help: 'all running process',
        labelNames: ['process_all']
      }),
      child_process_status_pending_gauge:new Prometheus.Gauge({
        name: 'current_child_process_status_pending',
        help: 'current pending process',
        labelNames: ['process_pending']
      }),
      child_process_status_ok_counter:new Prometheus.Counter({
        name: 'child_process_status_ok_total',
        help: 'all ok process',
        labelNames: ['process_ok']
      }),
      process_ok_clean_timer__status:new Prometheus.Gauge({
        name: 'process_ok_clean_timer_status',
        help: 'process_ok_clean_timer_status',
        labelNames: ['process_timer']
      }),
      up:new Prometheus.Gauge({
        name: 'up',
        help: 'metrics_status',
        labelNames: ['metrics_status']
      }),
      initGcStats: function(){
        const startGcStats = gcStats(Prometheus.register)
        startGcStats()
      },
      initMetrics:function(req,res){
        res.set('Content-Type', Prometheus.register.contentType)
        res.end(Prometheus.register.metrics())
      },
      defaultMetrics:function(){
        Prometheus.collectDefaultMetrics()
      }
}