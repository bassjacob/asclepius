# Asclepius

## API

### asclepius.`healthcheck(name: string, check: void => Promise<void>, timeoutDelay: ?number)`

### makeRunner

### makeRoute

## Example

healthchecks are functions that return a promise containing a result object `{ name: string, reason: string, healthy: bool }`. Name is used as a key for the healthcheck, and must be unique 

```
const { healthcheck } = require('asclepius');
const canHitDatabase = healthcheck('canHitDatabase', () => db.query('select current_timestamp'));
```


