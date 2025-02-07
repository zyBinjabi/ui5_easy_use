sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
    ],
    function (BaseController, JSONModel) {
        "use strict";

        return BaseController.extend("disclosureofform.controller.Helper.CreateReviewForm", {
            constructor: function (currentController) {
                this._currentController = currentController;
            },

            onInit: async function () {
            },

            convertRecordsToTransformedFields: function (records) {
                let transformedFieldsBack = {};

                records.forEach(record => {
                    const qNumber = record.Q_number;
                    const order = record.order;

                    // Initialize the object structure if it doesn't exist
                    if (!transformedFieldsBack[qNumber]) {
                        transformedFieldsBack[qNumber] = {};
                    }
                    if (!transformedFieldsBack[qNumber][order]) {
                        transformedFieldsBack[qNumber][order] = {};
                    }

                    // Populate fields (Q1, Q2, etc.)
                    for (let key in record) {
                        if (key.startsWith("Q")) {
                            transformedFieldsBack[qNumber][order][key] = record[key];
                        }
                    }
                });

                return transformedFieldsBack;
            },

            getQuestionsData: function (transformedFields, formQuestionsAndLabels) {
                let fromQuestionsAnswers = []; // Initialize an empty array to hold the extracted question and answer data.
                const subkeysEmty = [
                    { Org: { Q1: '', Q2: '' } },
                    { Org: { Q1: '', Q2: '', Q3: '', Q4: '' } },
                    { Org: { Q1: '', Q2: '' } },
                    { Org: { Q1: '', Q2: '', Q3: '' } },
                    { Org: { Q1: '', Q2: '', Q3: '' } },
                    { Org: { Q1: '', Q2: '', Q3: '', Q4: '', Q5: '' } },
                    { Org: { Q1: '', Q2: '', Q3: '', Q4: '' } },
                    { Org: { Q1: '', Q2: '', Q3: '', Q4: '', Q5: '' } },
                    { Org: { Q1: '', Q2: '' } }
                ]

                if (!transformedFields) {
                    // If transformedFields is not provided or is null/undefined, return an empty array.
                    return fromQuestionsAnswers;
                }

                // Extract keys from transformedFields that match the pattern "Ans<number>" (e.g., "Ans1", "Ans2").
                const mainKeys = Object.keys(transformedFields).filter(key => /^Ans\d+$/.test(key));

                // Iterate over each main key (e.g., "Ans1", "Ans2").
                mainKeys.forEach((mainKey) => {
                    // Extract the numeric part of the main key to identify the question number.
                    const questionNumber = parseInt(mainKey.match(/^Ans(\d+)$/)[1]);

                    // Adjust the question index to match the zero-based indexing of formQuestionsAndLabels.
                    const questionIndex = questionNumber - 1;

                    // Retrieve the object containing sub-keys (e.g., Ext1, Ext2, Org) for this question.
                    let subKeys = transformedFields[mainKey];
                    const answers = []; // Initialize an empty array to store answers for this question.
                    console.log("subKeys: ", subKeys)
                    if (!subKeys) {
                        subKeys = subkeysEmty[questionIndex]
                    }

                    // Loop through each sub-key (e.g., Ext1, Ext2, Org) within the main key.
                    Object.keys(subKeys).forEach((subKey) => {
                        const fields = subKeys[subKey]; // Retrieve the fields (e.g., Q1, Q2) for the current sub-key.

                        if (!fields) {
                            // If there are no fields for this sub-key, skip further processing for this sub-key.
                            return fromQuestionsAnswers;
                        }

                        // Iterate over each field (e.g., Q1, Q2) within the sub-key.
                        Object.keys(fields).forEach((fieldKey, fieldIndex) => {
                            // Skip any fields named "Q_number", as they are not part of the answers.
                            if (fieldKey === "Q_number") {
                                return;
                            }

                            // Add the label and value for the current field to the answers array.
                            answers.push({
                                labelBinding: formQuestionsAndLabels[questionIndex]?.Labels[fieldIndex], // Fetch the label using the field index.
                                valueBinding: fields[fieldKey] // Fetch the value for the field.
                            });
                        });
                    });

                    // Add the question and its associated answers to the fromQuestionsAnswers array.
                    fromQuestionsAnswers.push({
                        questionBinding: formQuestionsAndLabels[questionIndex]?.Q || `${questionNumber}:`, // Fetch the question text or use a default format.
                        answers: answers // Include the collected answers.
                    });
                });

                return fromQuestionsAnswers; // Return the array of questions and their answers.
            },



            getFormQuestionsAndLabels: function () {
                const forms = this.getForms(); // Use the getForms function you've defined
                const questionsAndLabels = [];

                // Iterate over each form
                forms.forEach((form) => {
                    form.getFormContainers().forEach((formContainer) => {
                        const formElements = formContainer.getFormElements();
                        const questionData = { Q: "", Labels: [] };

                        formElements.forEach((element, index) => {
                            const label = element.getLabel();
                            // console.log("element: ", element);
                            // console.log("label: ", label);

                            if (index === 0) {
                                // For the first element, get the question binding path
                                const fields = element.getFields();
                                fields.forEach((field) => {
                                    if (field.isA("sap.m.Text")) {
                                        const questionBinding = field.getBindingPath("text"); // Get the binding path of the question
                                        questionData.Q = questionBinding ? `{i18n>${questionBinding}}` : field.getText(); // Use binding if exists, otherwise get text
                                    }

                                    // Handle <l:Grid> elements
                                    if (field.isA("sap.ui.layout.Grid")) {
                                        // console.log("field: ", field);
                                        const firstContent = field.getContent()[0]; // Get the first <l:content> child element

                                        if (firstContent && firstContent.isA("sap.m.Text")) {
                                            const questionBinding = firstContent.getBindingPath("text"); // Get the binding path of the question
                                            questionData.Q = questionBinding ? `{i18n>${questionBinding}}` : firstContent.getText(); // Use binding if exists, otherwise get text
                                        }
                                    }

                                });
                            } else if (label) {
                                questionData.Labels.push(label); // Fallback to text if no binding path
                            }
                        });


                        // Add the extracted data to the result array
                        questionsAndLabels.push(questionData);
                    });
                });

                return questionsAndLabels;
            },

            getForms: function () {
                // Array to store forms
                const forms = [];

                // In another controller
                const viewId = this._currentController.getOwnerComponent().env.zVars.isProduction ? "application-${ez5.appName}-mange-component---DisclosureForm" : "container-${ez5.appName}---DisclosureForm"
                const oView = this._currentController.getOwnerComponent().byId(viewId);
                const oControl = oView.byId("CreateProductWizard");
                // console.log(oControl)

                // Get all steps in the wizard
                // const wizardSteps = this._currentController.byId("CreateProductWizard").getSteps();
                const wizardSteps = oControl.getSteps();

                // Loop through each step
                wizardSteps.forEach((wizardStep) => {
                    // Get all content of the current WizardStep
                    const content = wizardStep.getContent();

                    // Filter for form elements and add them to the array
                    const formsInStep = content.filter(control => control.isA("sap.ui.layout.form.Form"));

                    // Append to the forms array
                    forms.push(...formsInStep);
                });
                return forms
            },

            manageDynamicForm2: function (transformedFieldsBack) {
                // console.log("manageDynamicForm2 -> this.getFormQuestionsAndLabels(): ", this.getFormQuestionsAndLabels())

                // Convert the generated records back into the original transformed fields format
                // let transformedFieldsBack = this.convertRecordsToTransformedFields(records);
                // Reconstruct the original nested object structure from the flat records

                // console.log("manageDynamicForm2 -> this.getFormQuestionsAndLabels(): ", this.getFormQuestionsAndLabels())
                // console.log("manageDynamicForm2 -> transformedFieldsBack: ", transformedFieldsBack)
                // Retrieve the question data by mapping transformed fields back to the question and answer structure
                let questionsData = this.getQuestionsData(transformedFieldsBack, this.getFormQuestionsAndLabels());
                // console.log("manageDynamicForm2 -> questionsData: ", questionsData)
                // Generate data structure required for dynamic form creation based on the questions and transformed fields

                // Update the UI with a new dynamically generated form built from questionsData
                return questionsData

            },

            // ================================== # On Functions # ==================================
            checkIfAllAnswersAreEmpty: function (answers) {
                // Check if all valueBinding properties are empty
                const allEmpty = answers.every(answer => !answer.valueBinding || answer.valueBinding.trim() === "");

                return allEmpty; // Return true if all are empty, otherwise false
            },

            createDynamicForm: function (questionsData) {
                // Create a new form instance with editable set to false
                const oForm = new sap.ui.layout.form.Form({
                    editable: false,  // The form will not be editable
                    id: this._currentController.createId("newForm") // Ensure a unique ID for the new form
                });

                // Create a responsive grid layout for the form with appropriate settings for different screen sizes
                const oResponsiveGridLayout = new sap.ui.layout.form.ResponsiveGridLayout({
                    labelSpanXL: 4, // Label span for extra large screens
                    labelSpanL: 4,  // Label span for large screens
                    labelSpanM: 12, // Label span for medium screens
                    labelSpanS: 12, // Label span for small screens
                    adjustLabelSpan: false, // Do not adjust label span dynamically
                    emptySpanXL: 0, // No empty space for extra large screens
                    emptySpanL: 0,  // No empty space for large screens
                    emptySpanM: 0,  // No empty space for medium screens
                    emptySpanS: 0,  // No empty space for small screens
                    columnsXL: 1,   // Only 1 column for extra large screens (full width)
                    columnsL: 1,    // Only 1 column for large screens (full width)
                    columnsM: 1,    // Only 1 column for medium screens (full width)
                    columnsS: 1,    // Only 1 column for small screens (full width)
                    singleContainerFullSize: true // Ensure each FormContainer takes up the full width
                });

                // Set the layout for the form
                oForm.setLayout(oResponsiveGridLayout);

                // Iterate over the questionsData to process each question
                questionsData.forEach((question, index) => {
                    const oResourceBundle = this._currentController.getView().getModel("i18n").getResourceBundle(); // Get the i18n resource bundle

                    // Extract the question number from the questionBinding, e.g., from "{i18n>form.s6Question}" extract "6"
                    const match = question.questionBinding.match(/\.s(\d+)Question/);
                    const questionNumber = match ? match[1] : "Unknown"; // If match found, use the number, otherwise default to "Unknown"
                    const allEmpty = this.checkIfAllAnswersAreEmpty(question.answers)

                    const yesNoKey = allEmpty ? "no" : "yes"; // Determine the key for Yes/No
                    const yesNoText = oResourceBundle.getText(yesNoKey); // Fetch the translated Yes/No text

                    // Create a FormContainer for each question with a dynamic title based on the question number
                    const oFormContainer = new sap.ui.layout.form.FormContainer({
                        title: oResourceBundle.getText("questionTitle", [questionNumber, yesNoText]) // Bind Question and Yes/No
                    });

                    // Create a FormElement for the question text and add it to the FormContainer
                    const oQuestionTextElement = new sap.ui.layout.form.FormElement();
                    oQuestionTextElement.addField(new sap.m.Text({
                        text: `${question.questionBinding}`, // Binding for the question text
                        wrapping: true // Ensure the question text wraps if necessary
                    }));
                    oFormContainer.addFormElement(oQuestionTextElement); // Add the question text element to the FormContainer

                    // Loop through each label-answer pair to create FormElements for the answers
                    question.answers.forEach(answer => {
                        const oAnswerElement = new sap.ui.layout.form.FormElement({
                            label: `${answer.labelBinding}` // Binding for the label text (e.g., "Answer 1")
                        });

                        // Create a Text control to display the answer value
                        oAnswerElement.addField(new sap.m.Text({
                            text: `${answer.valueBinding}` // Binding for the answer text
                        }));
                        oFormContainer.addFormElement(oAnswerElement); // Add the answer element to the FormContainer
                    });

                    // Add the FormContainer to the main form
                    oForm.addFormContainer(oFormContainer);
                });

                // Return the generated form
                return oForm;
            },


            addFormToView: function (questionsData) {
                const oVBox = this._currentController.getView().byId("MainContarinerFormId");

                // Remove the old form if it exists
                oVBox.getItems().forEach((item, index) => {
                    if (index !== 0 && item.isA("sap.ui.layout.form.Form")) {
                        oVBox.removeItem(item).destroy(); // Remove and destroy the old form
                    }
                });

                // Create the new dynamic form
                const oDynamicForm = this.createDynamicForm(questionsData);

                // Add the new form to the VBox
                oVBox.addItem(oDynamicForm);
            },
        });
    }
);
