# Form Trigger Node

This document provides a detailed guide to configuring and using the **Form Trigger** node within the workflow editor.

## Overview

The Form Trigger node is a special trigger that allows you to create a public-facing web form. When a user submits this form, it can trigger a workflow and pass the submitted data as its output. This is ideal for use cases like contact forms, registration forms, surveys, or any process that needs to start with user-provided data.

## Parameters Tab

This tab contains all the settings to define the structure and behavior of your form.

### Form URLs

At the top of the parameters tab, you will find a section to get the URLs for your form.

- **Test URL:** This is a placeholder message. To get a temporary test link, click the **Run** button in the dialog. This will open the form in a new popup window for you to test its functionality.
- **Production URL:** This is a permanent, shareable link to your form. You can copy this URL and paste it into a browser to open the live version of the form. *Note: The backend logic to serve the form via this production URL is a future task.*

### Form Settings

- **Form Title:** The main title that will be displayed at the top of your public form page.
- **Form Description:** A short description or instruction that appears below the title.

### Form Fields Editor

This is the main section where you build your form by adding and configuring fields.

#### Adding and Removing Fields

- Click the **Add Field** button to add a new, empty field configuration block to your form.
- Click the **Delete** icon (a trash can) at the top right of a field block to remove it.

#### Field Properties

Each field has the following properties:

- **Label:** The user-friendly text that appears next to the input (e.g., "Your Email Address").
- **Name:** The machine-readable key for the field. This is automatically generated from the label (e.g., "your_email_address") but can be manually overridden. This name will be the key in the node's output data.
- **Type:** The type of form control to render. See **Field Types** below.
- **Placeholder:** The example text that appears inside an input field before the user types.
- **Required:** A toggle switch to make the field mandatory. If enabled, the form cannot be submitted unless the user fills out this field.

#### Field Types

The following field types are available:

- `string`, `email`, `password`, `textarea`, `number`: Basic text input fields with appropriate types.
- `boolean`: Renders as a large slide-toggle.
- `checkbox`: Renders as a single checkbox.
- `date`: Renders a text input with a Material date picker.
- `dropdown`: Renders a dropdown selection menu.
- `radio-group`: Renders a list of radio buttons.
- `custom-html`: Renders a block of raw HTML content. The content is configured via the **HTML Content** field that appears.
- `file`: Renders a file upload input.
- `hidden`: Renders a hidden input field.

#### Options Editor (for Dropdown & Radio Group)

When you select `dropdown` or `radio-group` as the field type, an **Options** editor will appear. Here you can:
- Click **Add Option** to create a new choice.
- For each option, define a **Label** (what the user sees) and a **Value** (the data that will be saved).
- Click the **Remove** icon next to an option to delete it.

### Response Mode

- **Respond when:** This dropdown at the bottom determines when the form trigger provides its output.
  - **Form is submitted:** (Default) The workflow receives the data immediately upon form submission.
  - **Workflow finishes:** The workflow will run to completion, and the final result of the workflow will be sent back as the response.

## Execution and Output

### Test Run

Clicking the **Run** button in the node settings dialog will open a popup window with a test version of your form. When you fill it out and click **Submit**, the popup will send the data back to the dialog.

### Output Data

The output of a successful test run will appear in the **Live Output Data** section of the **Output** column. The data is a JSON object where the keys are the `name` of each form field and the values are the data you submitted.

**Example Output:**
```json
{
  "customer_name": "Jane Doe",
  "customer_email": "jane.doe@example.com",
  "service_interest": "consulting"
}
```
