sap.ui.define([
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    "sap/ui/core/Messaging",
    "sap/ui/dom/isBehindOtherElement",
    'sap/ui/core/Element',
], function (MessagePopover, MessageItem, Messaging, isBehindOtherElement, Element) {
    "use strict";

    return class MessagePopoverHelper {

        /**
         * Creates an instance of the helper class for managing message popovers and form validation.
         *
         * @constructor
         * @param {object} currentController - The controller instance associated with this helper.
         * @param {string} [messageModel='message'] - The name of the model used for storing messages.
         * @param {string} [messagePopoverBtnId='messagePopoverBtnId'] - The ID of the button that triggers the message popover.
         * @param {string} [messageHandlingPageId='messageHandlingPage'] - The ID of the page where message handling occurs.
         * @param {string} [modelName='secondFormModel'] - The name of the main form model to validate.
         * @param {string} [formId='mainFormId'] - The ID of the form being managed or validated.
         */
        constructor(
            {
                _controllerJS,
                messageModel = 'message',
                messagePopoverBtnId,
                messageHandlingPageId = "SampleId",
                modelName = "formModel",
                formId = "formId"
            } = {}) {
            this._controllerJS = _controllerJS
            this.messageModel = messageModel;
            this.messagePopoverBtnId = messagePopoverBtnId;
            this.messageHandlingPageId = messageHandlingPageId;
            this.modelName = modelName;
            this.formId = formId;
            this.start()

        }

        start() {
            try {
                this._controllerJS._MessageManager = Messaging;
                // Clear the old messages
                this._controllerJS._MessageManager.removeAllMessages();


                // this._controllerJS._MessageManager.registerObject(this.oView.byId("formContainer"), true); //not affect
                this._controllerJS.getView().setModel(this._controllerJS._MessageManager.getMessageModel(), this.messageModel);

                this.createMessagePopover();

                var oButton = this._controllerJS.getView().byId(this.messagePopoverBtnId);
                this.oMP.getBinding("items").attachChange(function (oEvent) {
                    this.oMP.navigateBack();
                    oButton.setType(this.buttonTypeFormatter());
                    oButton.setIcon(this.buttonIconFormatter());
                    oButton.setText(this.highestSeverityMessages());
                }.bind(this));

                setTimeout(function () {
                    this.oMP.openBy(oButton);
                }.bind(this), 20);

            } catch (error) {
                console.error("Error loading the JSON model:", error);
            }
        }


        createMessagePopover() {
            let that = this._controllerJS
            let thatThis = this
            this.oMP = new MessagePopover({
                activeTitlePress(oEvent) {
                    var oItem = oEvent.getParameter("item"),
                        oPage = that.byId(thatThis.messageHandlingPageId),
                        oMessage = oItem.getBindingContext("message").getObject(),
                        oControl = Element.registry.get(oMessage.getControlId());

                    if (oControl) {
                        oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
                        setTimeout(function () {
                            var bIsBehindOtherElement = isBehindOtherElement(oControl.getDomRef());
                            if (bIsBehindOtherElement) {
                                this.close();
                            }
                            if (oControl.isFocusable()) {
                                oControl.focus();
                            }
                        }.bind(this), 150);
                    }
                },
                items: {
                    path: "message>/",
                    template: new MessageItem(
                        {
                            title: "{message>message}",
                            subtitle: "{message>additionalText}",
                            // groupName: { parts: [{ path: 'message>controlIds' }], formatter: this.getGroupName },
                            activeTitle: { parts: [{ path: 'message>controlIds' }], formatter: this.isPositionable },
                            type: "{message>type}",
                            description: "{message>message}"
                        })
                },
                groupItems: true
            });

            this._controllerJS.byId(this.messagePopoverBtnId).addDependent(this.oMP);
        }

        removeMessageFromTarget(sTarget) {
            this._controllerJS._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
                if (oMessage.target === sTarget) {
                    this._controllerJS._MessageManager.removeMessages(oMessage);
                }
            }.bind(this));
        }

        //===============================================## Working Here ## =======================================================================
        createMessagesForForm(mainModel, valueStates) {
            const oMessageManager = sap.ui.getCore().getMessageManager();
            const oView = this._controllerJS.getView(); // Reference to the current view

            // Clear existing messages
            oMessageManager.removeAllMessages();

            // Iterate over the valueStates object
            for (const [key, state] of Object.entries(valueStates)) {
                if (state.valueState === "Error") {
                    // Construct the target path
                    const sTarget = `/${key}`;

                    // Find the input field using key (assumes IDs match keys with '.' replaced by '_')
                    // const oInput = oView.byId(key.replace(/\./g, "_"));
                    const oInput = this.getControlByBinding(this.modelName, key, this.formId);

                    // Get the label associated with the input
                    let sAdditionalText = "";
                    if (oInput) {
                        const oFormElement = oInput.getParent(); // Get the parent form element
                        if (oFormElement.isA("sap.ui.layout.form.FormElement")) {
                            sAdditionalText = oFormElement.getLabel(); // Get the label's text
                        }
                    }

                    // Add the message to the MessageManager
                    oMessageManager.addMessages(
                        new sap.ui.core.message.Message({
                            message: state.valueStateText, // Error message
                            type: sap.ui.core.MessageType.Error, // Message type
                            target: sTarget, // Target field
                            additionalText: sAdditionalText, // Associated label text
                            processor: oView.getModel(mainModel) // Model processor
                        })
                    );
                }
            }
        }


        //===============================================## Helper ## =======================================================================
        getControlByBinding(modelName, bindingPath) {
            // Get all controls in the current view
            const view = this._controllerJS.getView();
            if (!view) {
                console.error("View not found.");
                return null;
            }

            // Recursively search all controls in the view
            const allControls = this._getAllControls(view);

            for (const control of allControls) {
                const binding = control.getBindingPath("value");
                if (binding && binding.includes(modelName) && binding.includes(bindingPath)) {
                    return control;
                }
            }

            console.warn(`Control with modelName "${modelName}" and bindingPath "${bindingPath}" not found.`);
            return null;
        }

        _getAllControls(container) {
            const controls = [];
            const children = container.getAggregation("content") || container.getAggregation("items");

            if (children) {
                if (Array.isArray(children)) {
                    children.forEach(child => {
                        controls.push(child);
                        // Recursively get controls from child containers
                        controls.push(...this._getAllControls(child));
                    });
                } else {
                    console.warn("Children is not an array:", children);
                }
            } return controls;
        }

        openMessage() {
            var oButton = this._controllerJS.getView().byId(this.messagePopoverBtnId);

            setTimeout(function () {
                this.oMP.openBy(oButton);
            }.bind(this), 20);
        }

        //===============================================## Working Here ## =======================================================================
        handleMessagePopoverPress(oEvent) {
            if (!this.oMP) {
                this.createMessagePopover();
            }
            this.oMP.toggle(oEvent.getSource());
        }
        //===============================================## Formatter ## =======================================================================

        // Display the button type according to the message with the highest severity
        // The priority of the message types are as follows: Error > Warning > Success > Info
        buttonTypeFormatter() {
            var sHighestSeverity;
            var aMessages = this._controllerJS._MessageManager.getMessageModel().oData;
            // console.log("aMessages: ", aMessages)
            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sHighestSeverity = "Negative";
                        break;
                    case "Warning":
                        sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
                        break;
                    case "Success":
                        sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ? "Success" : sHighestSeverity;
                        break;
                    default:
                        sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
                        break;
                }
            });

            return sHighestSeverity;
        }

        // Display the number of messages with the highest severity
        highestSeverityMessages() {
            var sHighestSeverityIconType = this.buttonTypeFormatter();
            var sHighestSeverityMessageType;

            switch (sHighestSeverityIconType) {
                case "Negative":
                    sHighestSeverityMessageType = "Error";
                    break;
                case "Critical":
                    sHighestSeverityMessageType = "Warning";
                    break;
                case "Success":
                    sHighestSeverityMessageType = "Success";
                    break;
                default:
                    sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                    break;
            }

            return this._controllerJS._MessageManager.getMessageModel().oData.reduce(function (iNumberOfMessages, oMessageItem) {
                return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
            }, 0) || "";
        }

        getGroupName(sControlId) {
            // the group name is generated based on the current layout
            // and is specific for each use case
            var oControl = Element.registry.get(sControlId);

            if (oControl) {
                var sFormSubtitle = oControl.getParent().getParent().getTitle().getText(),
                    sFormTitle = oControl.getParent().getParent().getParent().getTitle();
                // console.log(sFormTitle + ", " + sFormSubtitle)
                return sFormTitle + ", " + sFormSubtitle;
            }
        }

        isPositionable(sControlId) {
            // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
            return sControlId ? true : true;
        }

        // Set the button icon according to the message with the highest severity
        buttonIconFormatter() {
            var sIcon;
            var aMessages = this._controllerJS._MessageManager.getMessageModel().oData;

            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sIcon = "sap-icon://error";
                        break;
                    case "Warning":
                        sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                        break;
                    case "Success":
                        sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                        break;
                    default:
                        sIcon = !sIcon ? "sap-icon://information" : sIcon;
                        break;
                }
            });

            return sIcon;
        }


    };
});
