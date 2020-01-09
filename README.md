# node-process-fork-learning

> use node fork  model for create  task works && use prometheus for monitor

## How to Running

* local

```code
yarn start
open http://localhost:8080/metrics for prometheus info
curl -i http://localhost:8080/endpoint for fork works
curl -i http://localhost:8080/stop for stop processed works manually
curl -i http://localhost:8080/enable_timer for  enable auto processed works stop
```

*  with docker

```code
docker-compose up -d

```


