sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function (Controller) {
    "use strict";

    return Controller.extend("internal.utilities.UploadeFile", {
        constructor: function (currentController) {
            Controller.apply(this, currentController);

            this._currentController = currentController
            this.listObjFiles = []
            // Define your grouping functions
        },

        onInit: function () {
            // this._view = this.getView();
        },

        // ----------
        callUploadFiles: async function (finallData) {
            // Assuming listObj is already populated with actual events and keys
            // let listObj = [
            //     { oEvent: '', key: '' } // Populate this with real data
            // ];

            // Loop through each element in listObj
            if (this.listObjFiles.length === 0) {
                return finallData;
            }

            // console.log("this.listObjFiles", this.listObjFiles)

            for (let element of this.listObjFiles) {
                // console.log("element", element)
                // Await the promise returned by onFileChangeX
                let fileId = await this.onFileChangeX(element['oEvent']);

                // Assign the result to the appropriate key in finallData
                finallData[element['key']] = fileId;
            }

            return finallData
        },

        onFileChangeX: function (oEvent) {
            const oUploader = oEvent.getSource(); // Get the uploader that triggered the event
            const oFile = oEvent.getParameter("files")[0];
            // console.log("oFile", oFile)
            return new Promise((resolve, reject) => {
                if (oFile) {
                    // const sFileName = oFile.name;
                    // const sFileType = oFile.type || "application/octet-stream";
                    // const sSlugValue = `${this._currentController.userId}|${sFileName}`;
                    // const sToken = this._currentController.getView().getModel().getSecurityToken();


                    const sFileName = oFile.name;
                    const sFileType = oFile.type || "application/octet-stream";

                    // Get the current timestamp for both created_date and updated_date
                    const oCurrentDate = new Date();
                    const sFormattedDate = `${oCurrentDate.getFullYear()}${(oCurrentDate.getMonth() + 1).toString().padStart(2, '0')}${oCurrentDate.getDate().toString().padStart(2, '0')}${oCurrentDate.getHours().toString().padStart(2, '0')}${oCurrentDate.getMinutes().toString().padStart(2, '0')}${oCurrentDate.getSeconds().toString().padStart(2, '0')}`;

                    // Concatenate the userId, fileName, created_date, and updated_date into the slug
                    const sSlugValue = `${this._currentController.userId}|${sFileName}|${sFormattedDate}|${sFormattedDate}`;

                    // Fetch security token
                    const sToken = this._currentController.getView().getModel().getSecurityToken();


                    this.setupUploaderHeaders(oUploader, sSlugValue, sFileType, sToken);

                    this.uploadFileAsync(oUploader)
                        .then(fileId => {
                            console.log("fileId", fileId)
                            // console.log("File uploaded with ID:", fileId);
                            resolve(fileId); // Resolve the promise with the file ID
                            // Reset the FileUploader value
                            oUploader.clear(); // This will clear the file input

                        })
                        .catch(err => {
                            console.error("Upload failed:", err);
                            reject(err); // Reject the promise with the error
                        });
                } else {
                    reject("No file selected"); // Reject if no file is selected
                }

            });
        },

        setupUploaderHeaders: function (oUploader, sSlugValue, sFileType, sToken) {
            oUploader.removeAllHeaderParameters(); // Clear previous headers if necessary

            // Set headers
            oUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                name: "slug",
                value: sSlugValue
            }));
            oUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                name: "Content-Type",
                value: sFileType
            }));
            oUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                name: "X-CSRF-Token",
                value: sToken
            }));
        },

        uploadFileAsync: function (oUploader) {
            return new Promise((resolve, reject) => {
                // Attach the 'uploadComplete' event handler
                oUploader.attachUploadComplete(function (oEvent) {
                    const sResponse = oEvent.getParameter("response");

                    if (sResponse) {
                        try {
                            // Extract the File ID from the response string
                            const sFileIdMatch = sResponse.match(/UploadFileSet\('(.+?)'\)/);
                            if (sFileIdMatch && sFileIdMatch[1]) {
                                const sFileId = sFileIdMatch[1];
                                resolve(sFileId); // Resolve with the file ID
                            } else {
                                reject("File ID not found in response.");
                            }
                        } catch (e) {
                            console.error("Error extracting file ID from upload response:", e);
                            reject(e);
                        }
                    } else {
                        reject("No response received from the server.");
                    }
                }.bind(this));

                // Trigger the file upload
                oUploader.upload();
            });
        },

        downloadFile: function (sFileId) {
            // Construct the download URL
            const sServiceUrl = "/sap/opu/odata/SAP/ZBTP_ICTS_SRV_SRV";
            const sDownloadUrl = `${sServiceUrl}/UploadFileSet('${sFileId}')/$value`;

            // Trigger the download
            sap.m.URLHelper.redirect(sDownloadUrl, true);
        },

    });
});



