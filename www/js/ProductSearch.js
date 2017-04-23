'use strict';

/**
 * Application responsible for handling product search and displaying results on the UI
 *
 * @requires {{ko}} Knockout.js global object
 * @type {{getInstance}} Function make Singleton instance of the app
 */
var ProductSearch = (function () {

    // reference to the Singleton
    var instance;

    /**
     * Main class for the application
     *
     * @returns {{init: init}} Function - public function that kick-starts the app
     */
    function main() {
        var props = {}; // global constants, every method should see these

        props.API = 'http://exercise.wandome.com/';
        props.pageInitEndPoint = 'page/init';
        props.productListEndPoint = 'offer/list';
        props.token = '1234567890abcd.12345678';
        props.baseURL = 'http://products-i-want.co.uk';
        props.productList = {};

        /**
         * Helper for turning an object to query string, used for passing parameters to API endpoints from JS
         *
         * @param obj Object - The object that will be serialized
         * @returns {*} Boolean / String - Returns the query string by default, false if the passed obj is not an object
         */
        function objectToQueryString(obj) {
            var queryString = '';

            if (typeof obj === 'object') {
                Object.keys(obj).map(function (objectKey, index) {
                    var value = obj[objectKey],
                        paramPrefix = (index === 0 ? '?' : '&');
                    queryString += paramPrefix + objectKey + '=' + encodeURIComponent(value);
                });
                return queryString;
            } else {
                return false;
            }
        }

        /**
         * Query data from an endpoint using fetch API
         *
         * @param endpoint String - The relative url to the API endpoint
         * @param queryParameters Object - The object that stores the parameters
         * @param callback Function - Callback function for the promise
         */
        function getData(endpoint, queryParameters, callback) {
            var queryString = objectToQueryString(queryParameters),
                url = (queryString && queryString.length ? props.API + endpoint + queryString : props.API + endpoint),
                promiseData = fetch(url);

            promiseData
                .then(function (response) {
                    return response.json();
                })
                .then(function (json) {
                    if (json.status === 'success') {
                        callback.call(this, json);
                    } else {
                        // TODO: Add some error handling
                        console.warn('Error in the request');
                    }
                });
        }

        /**
         * A class for KO viewmodel
         *
         * @constructor
         */
        function ViewModel() {
            var viewModel = this;

            viewModel.products = ko.observable([]);

            viewModel.lang = ko.observable({});

            viewModel.loading = ko.observable(false);

            viewModel.emptyList = ko.observable(false);

            viewModel.keyword = ko.observable('');

            viewModel.uiState = ko.observable('base-state');

            viewModel.baseURL = props.baseURL;

            /**
             * Render the data on the UI
             *
             * @param jsonData Object - The result from the fetch query
             */
            viewModel.displayProducts = function (jsonData) {
                if (typeof jsonData === 'object' &&
                    jsonData.data &&
                    jsonData.data.offers &&
                    jsonData.data.offers.list) {

                    viewModel.products(jsonData.data.offers.list);

                    if(!jsonData.data.offers.list.length) {
                        viewModel.emptyList(true);
                    } else {
                        viewModel.emptyList(false);
                    }
                    viewModel.uiState('result-state');
                    viewModel.loading(false);
                }
            };

            /**
             * Save the lang Object's content to localStorage
             *
             * @param jsonData Object - The result from the fetch query
             */
            viewModel.saveLang = function(jsonData) {
                if(typeof jsonData === 'object' &&
                    jsonData.data &&
                    jsonData.data.lang &&
                    !window.localStorage.getItem('lang')) {
                    window.localStorage.setItem('lang', JSON.stringify(jsonData.data.lang));
                    viewModel.lang(jsonData.data.lang);
                }
            };

            /**
             * Reset every observable, this can be called on pressing the 'x' clear button above the input
             *
             */
            viewModel.reset = function() {
                viewModel.uiState('base-state');
                viewModel.keyword('');
                viewModel.products([]);
            };

            /**
             * Handler for the for submit
             *
             */
            viewModel.search = function () {
                if (viewModel.keyword().trim().length) {
                    viewModel.loading(true);
                    getData(
                        props.productListEndPoint,
                        {
                            keyword: viewModel.keyword().trim(),
                            token: props.token
                        }, viewModel.displayProducts);
                } else {
                    viewModel.products([]);
                    viewModel.uiState('base-state');
                    viewModel.loading(false);
                }
            };

            // Setup the language variables we got from the server
            if(!window.localStorage.getItem('lang')) {
                getData(props.pageInitEndPoint, {token: props.token}, viewModel.saveLang);
            } else {
                viewModel.lang(JSON.parse(window.localStorage.getItem('lang')));
            }

        }

        return {
            // Public methods and variables
            init: function () {
                ko.applyBindings(new ViewModel());
            }
        };

    }

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {

            if (!instance) {
                instance = main();
            }

            return instance;
        }

    };

})();
