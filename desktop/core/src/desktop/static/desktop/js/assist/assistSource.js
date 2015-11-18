// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(['knockout', 'desktop/js/assist/assistEntry'], factory);
  } else {
    root.AssistSource = factory(ko, AssistEntry);
  }
}(this, function (ko, AssistEntry) {

  /**
   * @param {Object} options
   * @param {Object} options.i18n
   * @param {AssistHelper} options.assistHelper
   * @param {string} options.type
   * @param {string} options.name
   * @constructor
   */
  function AssistSource (options) {
    var self = this;
    self.i18n = options.i18n;
    self.assistHelper = options.assistHelper;
    self.type = options.type;
    self.name = options.name;

    self.hasErrors = ko.observable(false);
    self.simpleStyles = ko.observable(false);

    self.filter = ko.observable("").extend({ rateLimit: 150 });

    self.filterActive = ko.computed(function () {
      return self.filter().length !== 0;
    });

    var storageSearchVisible = $.totalStorage(self.type + ".assist.searchVisible");
    self.searchVisible = ko.observable(storageSearchVisible || false);

    self.searchVisible.subscribe(function (newValue) {
      $.totalStorage(self.type + ".assist.searchVisible", newValue);
    });

    self.databases = ko.observableArray();
    self.selectedDatabase = ko.observable();

    self.reloading = ko.observable(false);

    self.loadingTables = ko.computed(function() {
      return typeof self.selectedDatabase() != "undefined" && self.selectedDatabase() !== null && self.selectedDatabase().loading();
    });

    self.selectedDatabase.subscribe(function (newValue) {
      if (newValue != null && !newValue.hasEntries() && !newValue.loading()) {
        newValue.loadEntries()
      }
    });

    self.loading = ko.observable(false);
    var dbIndex = {};
    var updateDatabases = function (names) {
      var lastSelectedDb = self.selectedDatabase() ? self.selectedDatabase().definition.name : null;
      dbIndex = {};
      self.databases($.map(names, function(name) {
        var database = new AssistEntry({
          name: name,
          displayName: name,
          title: name,
          isDatabase: true
        }, null, self, self.filter, self.i18n);
        dbIndex[name] = database;
        if (name === lastSelectedDb) {
          self.selectedDatabase(database);
        }
        return database;
      }));
      self.reloading(false);
      self.loading(false);
    };

    self.initDatabases = function () {
      self.loading(true);
      self.assistHelper.loadDatabases({
        sourceType: self.type,
        callback: updateDatabases
      });
    };

    self.modalItem = ko.observable();

    self.repositionActions = function(data, event) {
      if (data.definition.isDatabase) {
        var $container = $(event.target);
        $container.find(".assist-actions").css('right', -$container.scrollLeft() + 'px');
      }
    };

    self.reload = function() {
      self.reloading(true);
      self.assistHelper.clearCache(self.type);
      self.initDatabases();
    };

    huePubSub.subscribe('assist.refresh', self.reload);
  }

  return AssistSource;
}));
