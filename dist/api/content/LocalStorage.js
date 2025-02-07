sap.ui.define([], function () {
    "use strict";

    return class LocalStorage {
        constructor(_controllerJS) {
            this._controllerJS = _controllerJS;
        }

        /**
         * Save data to local storage.
         * @param {string} key - The key under which the data will be stored.
         * @param {*} newData - The data to save (can be an object, array, or primitive).
         */
        saveToLocalStorage(key, newData) {
            try {
                // Retrieve existing data from local storage
                const existingData = this.getFromLocalStorage(key);

                let updatedData;

                if (Array.isArray(existingData)) {
                    // If existing data is an array, append the new data
                    updatedData = [...existingData, newData];
                } else if (typeof existingData === 'object' && existingData !== null) {
                    // If existing data is an object, merge the new data
                    updatedData = { ...existingData, ...newData };
                } else {
                    // If no existing data, initialize with the new data
                    updatedData = Array.isArray(newData) ? [newData] : newData;
                }

                // Save the updated data back to local storage
                window.localStorage.setItem(key, JSON.stringify(updatedData));
                console.log(`Data saved successfully for key: ${key}`);
            } catch (error) {
                console.error(`Error saving data to local storage for key "${key}":`, error.message);
            }
        }

        /**
         * Retrieve data from local storage.
         * @param {string} key - The key for which to retrieve data.
         * @returns {*} - The retrieved data (or null if no data exists).
         */
        getFromLocalStorage(key) {
            try {
                const storedData = window.localStorage.getItem(key);

                if (!storedData) {
                    // Return null if no data exists for the key
                    return null;
                }

                // Parse and return the stored data
                return JSON.parse(storedData);
            } catch (error) {
                console.error(`Error retrieving data from local storage for key "${key}":`, error.message);
                return null;
            }
        }

        /**
         * Clear all data from local storage.
         */
        clearLocalStorage() {
            try {
                window.localStorage.clear();
                console.log('Local storage cleared successfully.');
            } catch (error) {
                console.error('Error clearing local storage:', error.message);
            }
        }
    };
});