'use strict';

const debug = require('debug')('ember-try:commands:try-embroider');
const testSetup = require('@embroider/test-setup');

module.exports = {
  name: 'try:embroider',
  description: 'Runs embroider safe/optimized tests',
  works: 'insideProject',

  anonymousOptions: ['<safe-optimized>'],

  availableOptions: [
    { name: 'skip-cleanup', type: Boolean, default: false },
    { name: 'config-path', type: String },
  ],

  _getConfig: require('../utils/config'),
  _TryEachTask: require('../tasks/try-each'),

  async run(commandOptions, rawArgs) {
    const embroiderOption = rawArgs[0];

    if (embroiderOption !== 'safe' && embroiderOption !== 'optimized') {
      throw new Error(
        'The `ember try:embroider <safe|optimized>` command requires a safe or optimized argument.'
      );
    }

    const scenarioName = 'embroider-' + embroiderOption;

    debug('Options:\n', commandOptions);
    debug('Embroider ', embroiderOption);

    let config = await this._getConfig({
      project: this.project,
      configPath: commandOptions.configPath,
    });

    debug('Config: %s', JSON.stringify(config));

    let tryEachTask = new this._TryEachTask({
      ui: this.ui,
      project: this.project,
      config,
    });

    let scenario = config.scenarios.find((scenario) => scenario.name === scenarioName);
    if (!scenario) {
      scenario = await (scenarioName === 'embroider-safe'
        ? testSetup.embroiderSafe()
        : testSetup.embroiderOptimized());
    }

    return await tryEachTask.run([scenario], { skipCleanup: commandOptions.skipCleanup });
  },
};
