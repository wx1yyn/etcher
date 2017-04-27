/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const m = require('mochainon');
const _ = require('lodash');
const angular = require('angular');
const units = require('../../../lib/shared/units');
const packageJSON = require('../../../package.json');
require('angular-mocks');

describe('Browser: UpdateNotifier', function() {

  beforeEach(angular.mock.module(
    require('../../../lib/gui/components/update-notifier')
  ));

  describe('UpdateNotifierService', function() {

    describe('.UPDATE_NOTIFIER_SLEEP_DAYS', function() {

      let UpdateNotifierService;

      beforeEach(angular.mock.inject(function(_UpdateNotifierService_) {
        UpdateNotifierService = _UpdateNotifierService_;
      }));

      it('should be an integer', function() {
        m.chai.expect(_.isInteger(UpdateNotifierService.UPDATE_NOTIFIER_SLEEP_DAYS)).to.be.true;
      });

      it('should be greater than 0', function() {
        m.chai.expect(UpdateNotifierService.UPDATE_NOTIFIER_SLEEP_DAYS > 0).to.be.true;
      });

    });

    describe('.shouldCheckForUpdates()', function() {

      let UpdateNotifierService;

      beforeEach(angular.mock.inject(function(_UpdateNotifierService_) {
        UpdateNotifierService = _UpdateNotifierService_;
      }));

      const UPDATE_NOTIFIER_SLEEP_MS = units.daysToMilliseconds(packageJSON.updates.sleepDays);

      _.each([

        // Given the `lastSleptUpdateNotifier` was never updated

        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: undefined,
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: undefined,
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: undefined,
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '1.0.0',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '1.0.0+6374412',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '1.0.0+foo',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: undefined,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },

        // Given the `lastSleptUpdateNotifier` was very recently updated

        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '1.0.0',
            currentVersion: '1.0.0'
          },
          expected: false
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '1.0.0+6374412',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '1.0.0+foo',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },

        // Given the `lastSleptUpdateNotifier` was updated in the future

        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '1.0.0',
            currentVersion: '1.0.0'
          },
          expected: false
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '1.0.0+6374412',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '1.0.0+foo',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },

        // Given the `lastSleptUpdateNotifier` was updated far in the future

        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '1.0.0',
            currentVersion: '1.0.0'
          },
          expected: false
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '1.0.0+6374412',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '1.0.0+foo',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() + UPDATE_NOTIFIER_SLEEP_MS + 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },

        // Given the `lastSleptUpdateNotifier` was updated long ago

        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '1.0.0',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '1.0.0+6374412',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '1.0.0+foo',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '0.0.0',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+6374412'
          },
          expected: true
        },
        {
          options: {
            lastSleptUpdateNotifier: Date.now() - UPDATE_NOTIFIER_SLEEP_MS - 1000,
            lastSleptUpdateNotifierVersion: '99.9.9',
            currentVersion: '1.0.0+foo'
          },
          expected: true
        }

      ], (testCase) => {

        it(_.join([
          `should return ${testCase.expected} if`,
          `lastSleptUpdateNotifier=${testCase.options.lastSleptUpdateNotifier},`,
          `lastSleptUpdateNotifierVersion=${testCase.options.lastSleptUpdateNotifierVersion}, and`,
          `currentVersion=${testCase.options.currentVersion}`
        ], ' '), function() {
          m.chai.expect(UpdateNotifierService.shouldCheckForUpdates(testCase.options)).to.equal(testCase.expected);
        });

      });

    });

  });

});
