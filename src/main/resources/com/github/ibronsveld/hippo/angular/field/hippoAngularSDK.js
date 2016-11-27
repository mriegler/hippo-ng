'use strict';
var sdkApp = angular.module('hippoAngularSDK', []);


/**
 * This is the controller providing the SDK to the actual plugin
 * @param $scope dependency
 * @param $timeout
 * @param $log
 * @param $element
 * @param $http
 * @param $mdDialog
 */
function hippoAngularSDK ($scope, $timeout, $log, $element, $http, $mdDialog) {

  /**
   * Gets the last time the model has been updated through the API
   * @returns {string|*} localized date
   */
  this.getLastChanged = function () {
    return $scope.lastChanged;
  }

  /**
   * Gets the last time the model has been loaded through the API
   * @returns {string|*} localized date and time
   */
  this.getLastUpdate = function () {
    return $scope.lastUpdate;
  }


  /**
   * Gets the mode that is set on the plugin (edit / compare)
   * @returns {string} mode that is set by the CMS
   */
  this.getMode = function () {
    return $scope.mode;
  }

  /**
   * Loads the model as it is currently available in the CMS.
   *
   * @returns {*} promise of the $http.post
   */
  this.loadModel = function () {
    $log.debug("Loading model");
    return this.post('getModel').then(
        function (response) {
          $scope.lastUpdate = new Date().toLocaleString();
          return response;
        },
        function (httpError) {
          // translate the error
          throw httpError.status + " : " +
          httpError.data;
        }
    );

  }

  /**
   * This method will update the current model in the CMS with the supplied model object
   * @param model
   * @returns {*} promise of the $http.post
   */
  this.updateModel = function (model) {
    $log.debug("Updating model");
    return this.post('setModel', model).then(
        function (response) {
          $scope.lastChanged = new Date().toLocaleString();
          return response;
        },
        function (httpError) {
          // translate the error
          throw httpError.status + " : " +
          httpError.data;
        }
    );
  };

  /**
   * Gets the configuration of the plugin in the Hippo Repository
   * @returns {*}
   */
  this.getPluginConfig = function() {
    $log.debug("Get Plugin Configuration");
    return this.post('config');
  }

  /**
   * Gets the associated attribute from the element. Provided for utility purposes
   * @param callbackName name of the attribute to look for.
   * @returns {*} attribute value
   */
  this.getAttribute = function (callbackName) {
    return $element.attr(callbackName);
  };

  /**
   * @DEPRECATED the get method if it can find the call back
   * @param callbackName
   * @returns {*} promise
   */
  this.executeCall = function (callbackName) {
    var queryUrl = this.getAttribute(callbackName);
    if (queryUrl != undefined) {
      return $http.get(queryUrl).then(
          function (response) {
            return response;
          },
          function (httpError) {
            // translate the error
            throw httpError.status + " : " +
            httpError.data;
          }
      );
    }
  }

  /**
   * Executes the post method.
   * @param action
   * @returns {*} promise
   */
  this.post = function (action, data) {
    var callbackName = 'post';
    var queryUrl = this.getAttribute(callbackName);
    if (queryUrl != undefined) {

      var postData = {};
      postData.action = action;
      postData.data = data;

      return $http.post(queryUrl, postData).then(
          function (response) {
            return response;
          },
          function (httpError) {
            // translate the error
            throw httpError.status + " : " +
            httpError.data;
          }
      );
    } else {
      throw 'callback not found';
    }
  }

  /**
   * @DEPRECATED
   * Executes the get method if it can find the call back
   * @param callbackName
   * @returns {*} promise
   */
  this.get = function (callbackName) {
    var queryUrl = this.getAttribute(callbackName);
    if (queryUrl != undefined) {
      return $http.get(queryUrl).then(
          function (response) {
            return response;
          },
          function (httpError) {
            // translate the error
            throw httpError.status + " : " +
            httpError.data;
          }
      );
    } else {
      throw 'callback not found';
    }
  }

  /**
   * Switches perspectives in the CMS by using the configured {@link org.onehippo.forge.angular.perspective.IAngularPerspectiveService}
   * @param name name of the service
   * @param action action to execute (provided to service)
   * @param option option to pass (provided to service)
   *
   */
  this.switchPerspective = function (name, action, option) {
    $log.debug("Switching perspectives");
    var callback = $element.attr('switchPerspective');
    if (callback != undefined) {

      $log.debug("Calling action " + action + " for name " + name + " with options " + JSON.stringify(option));
      callback = callback.replace('__ACTION', action);
      callback = callback.replace('__OPTION', option);
      callback = callback.replace('__NAME', name);

      eval(callback);
    }
  }

  // /**
  //  * Gets the user information from the CMS
  //  * @returns {*}
  //  */
  // this.getUserSessionInfo = function () {
  //   $log.debug("Loading userInfo");
  //   return this.get('getUserSessionInfo');
  // }
}

sdkApp.directive('hngSdk',  function () {
  return {
    restrict: 'A',
    scope: {
      mode: '@'
    },
    controller: ['$scope', '$timeout', '$log', '$element', '$http', '$mdDialog', hippoAngularSDK]
  };
});