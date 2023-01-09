'use strict';

const { expect } = require('chai');
const RSVP = require('rsvp');
const TryEmbroiderCommand = require('../../lib/commands/try-embroider');
const testSetup = require('@embroider/test-setup');

const origTryEachTask = TryEmbroiderCommand._TryEachTask;
const origEmbroiderSafe = testSetup.embroiderSafe;
const origEmbroiderOptimized = testSetup.embroiderOptimized;
const origGetConfig = TryEmbroiderCommand._getConfig;

const embroiderSafe_testSetup = {
  name: 'embroider-safe',
  npm: {
    devDependencies: {
      'test-setup-test-dependency': '1.0.0',
    },
  },
};

const embroiderOptimized_testSetup = {
  name: 'embroider-optimized',
  npm: {
    devDependencies: {
      'test-setup-test-dependency': '1.0.0',
    },
  },
};

describe('commands/try-embroider', () => {
  describe('#run', () => {
    function MockTryEachTask() {}
    MockTryEachTask.prototype.run = (choosenScenarios) => RSVP.resolve(choosenScenarios);

    beforeEach(() => {
      TryEmbroiderCommand._TryEachTask = MockTryEachTask;

      testSetup.embroiderSafe = () => RSVP.resolve(embroiderSafe_testSetup);
      testSetup.embroiderOptimized = () => RSVP.resolve(embroiderOptimized_testSetup);
    });

    afterEach(() => {
      TryEmbroiderCommand._TryEachTask = origTryEachTask;
      testSetup.embroiderSafe = origEmbroiderSafe;
      testSetup.embroiderOptimized = origEmbroiderOptimized;
      TryEmbroiderCommand._getConfig = origGetConfig;
    });

    it('it runs the embroider safe from the config if available', async () => {
      const embroiderSafe_config = {
        name: 'embroider-safe',
        npm: {
          devDependencies: {
            'config-test-dependency': '1.0.0',
          },
        },
      };

      TryEmbroiderCommand._getConfig = () =>
        RSVP.resolve({
          scenarios: [embroiderSafe_config],
        });

      const scenarios = await TryEmbroiderCommand.run({}, ['safe']);
      expect(scenarios).to.be.an('array');
      expect(scenarios.length).to.equal(1);
      expect(scenarios[0]).to.equal(embroiderSafe_config);
    });

    it('it runs the embroider optimized from the config if available', async () => {
      const embroiderOptimized_config = {
        name: 'embroider-optimized',
        npm: {
          devDependencies: {
            'config-test-dependency': '1.0.0',
          },
        },
      };

      TryEmbroiderCommand._getConfig = () =>
        RSVP.resolve({
          scenarios: [embroiderOptimized_config],
        });

      const scenarios = await TryEmbroiderCommand.run({}, ['optimized']);
      expect(scenarios).to.be.an('array');
      expect(scenarios.length).to.equal(1);
      expect(scenarios[0]).to.equal(embroiderOptimized_config);
    });

    it('it uses embroiderSafe function from @embroider/test-setup if embroider-safe/optimized are not in config', async () => {
      TryEmbroiderCommand._getConfig = () =>
        RSVP.resolve({
          scenarios: [
            {
              name: 'ember-release',
            },
          ],
        });

      const scenarios = await TryEmbroiderCommand.run({}, ['safe']);
      expect(scenarios).to.be.an('array');
      expect(scenarios.length).to.equal(1);
      expect(scenarios[0]).to.equal(embroiderSafe_testSetup);
    });

    it('it uses embroiderOptimized function from @embroider/test-setup if embroider-safe/optimized are not in config', async () => {
      TryEmbroiderCommand._getConfig = () =>
        RSVP.resolve({
          scenarios: [
            {
              name: 'ember-release',
            },
          ],
        });

      const scenarios = await TryEmbroiderCommand.run({}, ['optimized']);
      expect(scenarios).to.be.an('array');
      expect(scenarios.length).to.equal(1);
      expect(scenarios[0]).to.equal(embroiderOptimized_testSetup);
    });
  });
});
