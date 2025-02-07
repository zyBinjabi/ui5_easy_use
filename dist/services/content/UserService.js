sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("${ez5.appName}.utilities.UserService", {
        constructor: function (currentController, userId) {
            this.userId = userId
            this._currentController = currentController;
            this.userinfoFullObj = null
        },

        getUserinfoFullObj: async function () {
            if (!this.userId) { return false }

            const mModel = this._currentController.getModel("v21");

            try {
                const userDetailurl = `${mModel.sServiceUrl}/User?$filter=userId eq '${this.userId}'&$expand=manager&$format=json`;
                // const userDetailurl = `${mModel.sServiceUrl}/User('10125')/empInfo&$format=json`;
                const response = await fetch(userDetailurl);
                const jobData = await response.json();

                return jobData.d.results[0]
                return jobData
            } catch (error) {
                console.error("Failed to fetch roles Details", error);
            }

        },

        getUserInfo: async function () {
            // this.userInfo = this.getUserInfo(this.userinfoFullObj)

            this.userinfoFullObj = await this.getUserinfoFullObj()
            // console.log("UserService -> this.userinfoFullObj: ", this.userinfoFullObj)
            // // this.userinfoFullObj = {'name':"namez"}
            if (!this.userinfoFullObj) {
                console.error("---------------- ##No User Found!!!!## ----------------")
                return false
            }
            // console.log("UserService -> getUserInfo -> this.userinfoFullObj", this.userinfoFullObj)

            this.userInfo = {
                empId: this.userinfoFullObj?.userId || Number(this.userId),
                userEmail: this.userinfoFullObj?.username || "Damy Data",
                userLocation: this.userinfoFullObj?.city || "Damy Data",
                displayName: `${this.userinfoFullObj?.displayName}` || "Damy Data",
                // displayName: `${this.userinfoFullObj?.displayName}(${this.userinfoFullObj?.userId})` || "Damy Data",
                position: this.userinfoFullObj?.title || "Damy Data",
                grade: this.userinfoFullObj?.payGrade || "Damy Data",
                division: this.userinfoFullObj?.division || "Damy Data",
                department: this.userinfoFullObj?.department || "Damy Data",
                city: this.userinfoFullObj?.city || "Damy Data",
                managerName: this.userinfoFullObj?.manager?.displayName || "Damy Data",
                managerId: this.userinfoFullObj?.manager?.userId || "Damy Data",
                managerEmail: this.userinfoFullObj?.manager?.username || "Damy Data",
            }

            // console.log("UserService -> this.userInfo: ", this.userInfo)
            return this.userInfo
        },

        getTaskDetails: function (userInfo, status, step, sendTo, sendToName) {
            let isMangeerExist = userInfo?.managerName && userInfo?.managerId ? true : false
            status = (!isMangeerExist && status === "Pending") ? "Approved" : status  // To Go next Lvl if no Line manager is Exist.
            console.log("UserService -> getTaskDetails -> userInfo", userInfo)
            let namesSendtoXForUni = this.formatSendToNames(userInfo.managerId, userInfo.managerName)

            // Access i18n model
            const oResourceBundle = this._currentController.getModel("i18n").getResourceBundle();

            const statusTextsi18n = {
                textForwardedTo: oResourceBundle.getText("ForwardedTo"),
                textApprovedBy: oResourceBundle.getText("ApprovedBy"),
                textRejectedBy: oResourceBundle.getText("RejectedBy"),
                textReturnedBy: oResourceBundle.getText("ReturnedBy"),
                textAssignedBy: oResourceBundle.getText("AssignedBy"),
                textReAssignedBy: oResourceBundle.getText("ReAssignedBy"),
                textWorkInProgressBy: oResourceBundle.getText("WorkInProgressBy"),
                textCompletedBy: oResourceBundle.getText("CompletedBy"),
                textClosedBy: oResourceBundle.getText("ClosedBy")
            };

            const detailsMap = {
                "Pending": {
                    statusDisplay: isMangeerExist
                        ? `${statusTextsi18n.textForwardedTo}: ${userInfo.managerName}(${userInfo.managerId})`
                        : `${statusTextsi18n.textForwardedTo}: ${sendToName}(${sendTo})`,
                    sendto: isMangeerExist ? userInfo.managerId : sendTo,
                    sendToName: isMangeerExist ? namesSendtoXForUni : sendToName,
                    steps: 1
                },
                "Approved": {
                    statusDisplay: `${statusTextsi18n.textApprovedBy}: ${userInfo?.displayName}(${userInfo?.empId})`,
                    sendto: sendTo,
                    sendToName: sendToName,
                    steps: step + 1
                },
                "Rejected": {
                    statusDisplay: `${statusTextsi18n.textForwardedTo}: ${userInfo?.displayName}(${userInfo?.empId})`,
                    sendto: '',
                    sendToName: '',
                    steps: 100
                },
                "Returned": {
                    statusDisplay: `${statusTextsi18n.textReturnedBy}: ${userInfo?.displayName}(${userInfo?.empId})`,
                    sendto: sendTo,
                    sendToName: sendToName,
                    steps: 0
                },
                "Assigned": {
                    statusDisplay: `${statusTextsi18n.textAssignedBy}: ${userInfo?.displayName}(${userInfo?.empId})`,
                    sendto: sendTo,
                    sendToName: sendToName,
                    steps: step + 1
                },
                "ReAssignee": {
                    statusDisplay: `${statusTextsi18n.textReAssignedBy}: ${userInfo?.displayName}(${userInfo?.empId})`,
                    sendto: sendTo,
                    sendToName: sendToName,
                    steps: step
                },
                "WorkInProgress": {
                    statusDisplay: `${statusTextsi18n.textWorkInProgressBy}: ${userInfo?.displayName}(${userInfo?.empId})`,
                    sendto: sendTo,
                    sendToName: sendToName,
                    steps: step
                },
                "Completed": {
                    statusDisplay: `${statusTextsi18n.textCompletedBy}: ${userInfo?.displayName}(${userInfo?.empId})`,
                    sendto: sendTo,
                    sendToName: sendToName,
                    steps: 99
                },
                "Closed": {
                    statusDisplay: `${statusTextsi18n.textClosedBy}: ${userInfo?.displayName}(${userInfo?.empId})`,
                    sendto: '',
                    sendToName: '',
                    steps: 100
                }
            };

            return detailsMap[status];
        },

        getRequesteData: async function (obj) {
            let status = obj?.status;
            let status2 = obj?.status2 || status;
            let sendTo = obj?.sendTo;
            let sendToName = obj?.sendToName;
            let step = obj?.step;
            let lastActionBy = obj?.lastActionBy
            let userInfo = this.userInfo || {};

            // Assuming getTaskDetails returns an object with "StatusDisplay", "Sendto", and "Steps"
            const workFlow = this.getTaskDetails(userInfo, status, step, sendTo, sendToName);
            return {
                Status: status == "ReAssignee" ? status2 : status, // This will be one of: Pending, Approved, Rejected, Returned, Closed
                Status2: status2,
                StatusDisplay: workFlow?.statusDisplay || "",
                Sendto: workFlow?.sendto,
                SendtoName: workFlow?.sendToName,
                Steps: workFlow?.steps,
                LastActionBy: status == 'WorkInProgress' ? lastActionBy : `${userInfo.displayName || "Unknown"}(${userInfo.empId || "Unknown"})`,
                LastActionDate: new Date(),
                AssignedDate: new Date(), // Renamed from assigned_date
                EscalationId: status == 'Approved' ? obj.escalationId : "",
                EscalationLevelId: obj.escalationLevelId
            };
        },

        getRequesterData: async function () {
            let userInfo = this.userInfo
            return {
                RequesterId: userInfo?.empId, // Renamed from requester_id
                RequesterName: userInfo?.displayName, // Renamed from requester_name
                RequesterPosition: userInfo?.jobCode, // Renamed from requester_position
                RequesterSection: userInfo?.department, // Renamed from requester_section
                RequesterDept: userInfo?.division, // Renamed from requester_dept
                RequesterLocation: userInfo?.city, // Renamed from requester_location
            }
        },

        getUserInfoWithRequestTamp: async function (obj) {
            let requesteData = await this.getRequesteData(obj?.RequesteData)
            let requesterData = obj.RequesteData.status == "Pending" ? await this.getRequesterData() : obj?.RequesterData

            // console.log("UserService -> requesteData: ", requesteData)
            // console.log("UserService -> requesterData: ", requesterData)

            return {
                ...requesteData, ...requesterData
            };


            return requesteData
        },

        getRequestHistoryObj: async function (Obj) {
            let userInfo = this.userInfo || {};

            if (!userInfo) { return false }

            const ProcessedId = userInfo.empId || 'Unknown';
            const ProcessedBy = userInfo.displayName || 'Unknown User';

            let RequestId = Obj?.RequestId || '0000000000';
            let SendtoName = Obj?.SendtoName;
            let CommentZ = Obj?.Status == "Pending" ? `New Request.` : Obj?.CommentZ || "--";
            let SeqId = Obj?.SeqId;
            let Status = Obj?.Status;


            // Adjusting status for the 'action' field
            const AdjustedStatus = Status === 'Pending' ? 'Submitted' : Status;

            // Adjusting sendtoName if the status is 'Pending'
            return {
                SeqId: SeqId ? SeqId + 1 : 1, // Assuming this is auto-generated or set elsewhere
                RequestId: RequestId,
                CommentZ: CommentZ,
                Status: Status,
                ProcessedId: ProcessedId,
                ProcessedBy: ProcessedBy,
                ActionDateTime: new Date(),
                Action: `${AdjustedStatus} by: ${ProcessedBy}(${ProcessedId})`,
                SendtoName: SendtoName,
            };
        },

        formatSendToNames: function (sIds, sNames) {
            if (!sIds || !sNames) return "";

            // Split IDs and names by commas
            const idArray = sIds.split(", ");
            const nameArray = sNames.split(", ");

            // Ensure both arrays are the same length
            if (idArray.length !== nameArray.length) return "";

            // Combine names and IDs in the format "FirstName LastName (ID)"
            const combinedArray = nameArray.map((name, index) => {
                const firstNameLastName = name.split(" ").slice(0, 2).join(" ");  // Assuming names are formatted with first and last names
                return `${firstNameLastName} (${idArray[index]})`;
            });

            // Join the results with a separator (e.g., comma)
            return combinedArray.join(", ");
        },


    });
});







