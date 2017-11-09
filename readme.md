# Asclepius

Asclepius is a healthcheck module that allows you to define functions that report back their status. Much like the famed doctor of mythology, it will diagnose and prescribe fixes for whatever ails your applications.

## API

```javascript
// some base types
type resultType = { healthyType: bool, name: string, reason: string };
type healthcheckType = () => Promise<resultType>;
type resultsType = { [string]: { healthy: bool, reason: string } };
```

### asclepius.`healthcheck(name, check, timeoutDelay)`

`string -> (void -> Promise<mixed>) -> ?number -> healthcheckType`


### asclepius.`makeRunner(healthchecks: Array<>)`

`Array<healthcheckType> -> void -> Promise<{ healthy: bool, results: resultsType }>`

### asclepius.`makeRoute()`

`Array<healthcheckType> -> expressRoute`

## Example

```javascript
const { healthcheck, makeRoute } = require('asclepius');
const canHitDatabase = healthcheck('canHitDatabase', () => db.query('select current_timestamp'));
const canHitRedis = healthcheck('canHitRedis', () => redis.get('__not_a_key__'));

app.get('/health', makeRoute([canHitDatabase, canHitRedis]));
```
