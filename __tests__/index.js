// @flow

const { makeRunner, healthcheck, timeout, makeRoute, format } = require('..');

describe('Asclepius', () => {
  describe('healthcheck', () => {
    describe('without a timeout', () => {
      it('resolves with healthy true if success', () => {
        expect.assertions(1);
        const name = 'foo';

        return healthcheck(name, () => Promise.resolve())().then(r =>
          expect(r).toEqual({ healthy: true, name, reason: 'OK' })
        );
      });

      it('resolves with healthy false if failure', () => {
        expect.assertions(1);
        const name = 'foo';

        return healthcheck(name, () => Promise.reject('reason'))().then(r =>
          expect(r).toEqual({ healthy: false, name, reason: 'reason' })
        );
      });
    });

    describe('with a timeout', () => {
      it('resolves with healthy true if success', () => {
        expect.assertions(1);
        const name = 'foo';

        return healthcheck(name, () => Promise.resolve(), 10)().then(r =>
          expect(r).toEqual({ healthy: true, name, reason: 'OK' })
        );
      });

      it('resolves with healthy false if failure', () => {
        expect.assertions(1);
        const name = 'foo';

        return healthcheck(name, () => Promise.reject('reason'), 10)().then(r =>
          expect(r).toEqual({ healthy: false, name, reason: 'reason' })
        );
      });

      it('resolves with healthy false if timeout', () => {
        expect.assertions(1);
        const name = 'foo';

        return healthcheck(
          name,
          () => new Promise(resolve => setTimeout(resolve, 100)),
          10
        )().then(r =>
          expect(r).toEqual({
            healthy: false,
            name,
            reason: 'timed out after 10ms',
          })
        );
      });
    });
  });

  describe('timeout', () => {
    it('does not resolve before the timeout', () =>
      Promise.race([
        new Promise(resolve => setTimeout(resolve, 10)),
        timeout(11).then(() => Promise.reject('reject')),
      ]).then(() => expect(true).toEqual(true)));

    it('resolves after the timeout', () => {
      expect.assertions(1);
      return Promise.race([
        new Promise(resolve => setTimeout(resolve, 10)),
        timeout(2).then(() => Promise.reject('reject')),
      ]).catch(() => expect(true).toEqual(true));
    });
  });

  describe('makeRunner', () => {
    it('resolves if the healthchecks list is empty', () =>
      makeRunner([])().then(results =>
        expect(results).toEqual({ healthy: true, results: {} })
      ));

    it('runs the healthchecks and sets healthy true if they all pass', () =>
      makeRunner([healthcheck('foo', () => Promise.resolve())])().then(
        results =>
          expect(results).toEqual({
            healthy: true,
            results: { foo: { healthy: true, reason: 'OK' } },
          })
      ));

    it('runs the healthchecks and sets healthy false if any fail', () =>
      makeRunner([
        healthcheck('foo', () => Promise.reject('reason')),
        healthcheck('bar', () => Promise.resolve()),
      ])().then(results =>
        expect(results).toEqual({
          healthy: false,
          results: {
            foo: { healthy: false, reason: 'reason' },
            bar: { healthy: true, reason: 'OK' },
          },
        })
      ));
  });

  describe('makeRoute', () => {
    it('sets status to 200 and responds with a healthy packet if healthchecks pass', () => {
      expect.assertions(2);
      const res = {
        status: x => {
          expect(x).toEqual(200);
          return res;
        },
        json: x => {
          expect(x).toEqual({
            healthy: true,
            results: { foo: { healthy: true, reason: 'OK' } },
          });
        },
      };
      return makeRoute([healthcheck('foo', () => Promise.resolve())])(
        null,
        res,
        (x /* : string */) => {
          throw new Error(`should not get here: ${x}`);
        }
      );
    });

    it('sets status to 500 and responds with an unhealthy packet if healthchecks pass', () => {
      expect.assertions(2);
      const res = {
        status: x => {
          expect(x).toEqual(500);
          return res;
        },
        json: x => {
          expect(x).toEqual({
            healthy: false,
            results: { foo: { healthy: false, reason: 'reason' } },
          });
        },
      };
      return makeRoute([healthcheck('foo', () => Promise.reject('reason'))])(
        null,
        res,
        (x /* : string */) => {
          throw new Error(`should not get here: ${x}`);
        }
      );
    });
  });

  describe('format', () => {
    it('sets healthy false if any results are unhealthy', () => {
      expect(
        format({
          foo: { healthy: false, reason: 'reason' },
          bar: { healthy: true, reason: 'OK' },
        }).healthy
      ).toEqual(false);
    });

    it('sets healthy true if no results are unhealthy', () => {
      expect(format({ foo: { healthy: true, reason: 'OK' } }).healthy).toEqual(
        true
      );
    });
  });
});
