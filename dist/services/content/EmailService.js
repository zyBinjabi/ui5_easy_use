sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "${ez5.appName}/utilities/CRUD_z",
], function (Controller, CRUD_z) {
    "use strict";

    return Controller.extend("${ez5.appName}.utilities.EmailService", {
        constructor: function (currentController) {
            this._currentController = currentController;
            this.crud_z = new CRUD_z(currentController, "ZEMAIL_NOTIFICATION_SRV")
            this.endsPoint = "ZCA_S_EMAIL_NOTIFICATIONSet"
        },

        onInit: async function () {
        },

        start: async function (finallData, historyOb) {
            // console.log("EmailService -> finallData: ", finallData)
            // console.log("EmailService -> historyOb: ", historyOb)

            // let sendToList = finallData.Sendto -- > "14717, 10125" || "14717"
            let sendToList = finallData.Sendto.includes(',')
                ? finallData.Sendto.split(',').map(id => id.trim())
                : [finallData.Sendto.trim()];

            sendToList = finallData.Status == "Closed" ? [finallData.RequesterId] : sendToList // send to Requester

            for (let index = 0; index < sendToList.length; index++) {
                let data = {
                    "SendTo": `${sendToList[index]}@nadec.com.sa`,
                    // "SendTo": `30464@nadec.com.sa`,
                    "Subject": this.getSubject(finallData, historyOb),
                    "Body": this.getBody(finallData, historyOb)
                    // "Body": "BOdy"
                }

                console.log("Data of Email: ", data)
                let res = await this.crud_z.post_record(this.endsPoint, data)  // Call------------
            }
        },

        getSubject: function (finallData, historyOb) {
            // const mainServiceName = this._currentController.formatMainServiceText(finallData.MainService)
            // return `تواصل-Tawasul - ${mainServiceName} - Request Id: ${Number(finallData.Id)}`
            return `تواصل-Tawasul - Request Id: ${Number(finallData.Id)}`
        },

        getBody: function (finallData, historyOb) {
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toDateString() + " " + date.toTimeString().split(" ")[0];
            };

            historyOb.SendtoName = finallData.Status == "Closed" ? `${finallData.RequesterName}(${finallData.RequesterId})` : historyOb.SendtoName
            var emailBody = `<html>
  <body>
    <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9; max-width: 600px; margin: auto; font-family: Arial, sans-serif; line-height: 1.6;">
      <p><strong>Action:</strong> ${historyOb.Action}</p>
      <br>
      <p>https://nadec-prd.workzone.cfapps.eu10.hana.ondemand.com/site#${ez5.appName}_cts-mange?sap-ui-app-id-hint=saas_approuter_${ez5.appName}&/RouteMyTasks</p>
    </div>
  </body>
</html>`

            // Replace 'YOUR_LINK_HERE' with the actual URL
            // emailBody = emailBody.replace("YOUR_LINK_HERE", "https://your-link-here.com");
            emailBody
                .replace(/\s+/g, ' ') // Replaces multiple spaces/newlines with a single space
                .trim();
            return emailBody
        },

        // getBody: function (finallData, historyOb) {
        //     var emailBody = `
        //                         <html>
        //                         <head>
        //                             <style>
        //                                 body { font-family: Arial, sans-serif; line-height: 1.6; }
        //                                 .email-container { padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9; max-width: 600px; margin: auto; }
        //                                 h2 { color: #333; }
        //                                 p { margin: 10px 0; }
        //                                 a { color: #3498db; text-decoration: none; }
        //                                 .button { background-color: #3498db; color: white; padding: 10px 20px; text-align: center; display: inline-block; margin: 10px 0; border-radius: 5px; text-decoration: none; }
        //                             </style>
        //                         </head>
        //                         <body>
        //                             <div class="email-container">
        //                                 <h2>Dear ${finallData.SondtoName},</h2>
        //                                 <p><strong>Action:</strong> ${historyOb.Action}</p>
        //                                 <h4>Request Id: ${Number(finallData.Id)},</h4>
        //                                 <p><strong>Comment:</strong> ${historyOb.CommentZ}</p>
        //                                 <p><strong>Step:</strong> ${finallData.Steps}</p>
        //                                 <p><strong>Request Date:</strong> ${finallData.CreatedDate}</p>
        //                                 <p>Please click the link below to take action:</p>
        //                                 <a href="YOUR_LINK_HERE" class="button">Go to Request</a>
        //                                 <p>Thank you!</p>
        //                             </div>
        //                         </body>
        //                         </html>
        //                     `;

        //     // Replace 'YOUR_LINK_HERE' with the actual URL
        //     emailBody = emailBody.replace("YOUR_LINK_HERE", "https://your-link-here.com");

        //     return emailBody
        // },


        // Re Cofery
    //     <body>
    //     <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9; max-width: 600px; margin: auto; font-family: Arial, sans-serif; line-height: 1.6;">
    //       <h2 style="color: #333;">Dear ${historyOb.SendtoName},</h2> 
    //       <p><strong>Action:</strong> ${historyOb.Action}</p>
    //       <h4>Request Id: ${Number(finallData.Id)},</h4>
    //       <p><strong>Comment:</strong> ${historyOb.CommentZ}</p>
    //       <p><strong>Request Date:</strong> ${formatDate(finallData.CreatedDate)}</p>
    //       <br>
    //       <p>https://nadec-prd.workzone.cfapps.eu10.hana.ondemand.com/site#${ez5.appName}_cts-mange?sap-ui-app-id-hint=saas_approuter_${ez5.appName}</p>
    //       <br>
    //       <p>Thank you!</p>
    //     </div>
    //   </body>

    });
});







