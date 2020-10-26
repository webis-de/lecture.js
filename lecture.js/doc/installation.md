[lecture.js](../README.md) > [Documentation](README.md) > **Installation**

---

This is a step-by-step guide on how to set up lecture.js on your machine.



# 1. Requirements

There are a number of requirements for lecture.js to run.

1. Use the operating system **Windows 10 (64-Bit)** or **Linux Ubuntu 16.04+**.
2. Install **Node.js** version 12 or higher:
    1. On Windows 10, you need download and execute the [installer](https://nodejs.org/en/download/).
    2. On Linux Ubuntu, you need to follow these [instructions](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions).
    3. Test if the installation was successful by entering `node --version` in the terminal.
3. **NPM** should already be included in the Node.js installation. Test it by entering `npm --version` in the terminal.
    If NPM is not directly included (which can be the case on Linux), run the following command to install it:
    ```
    sudo apt install npm
    ```
4. Install a recent **[Java Runtime Environment](https://www.oracle.com/java/technologies/javase-jre8-downloads.html)** on your machine. Test it by entering `java -version` in the terminal.
   
# 2. Install the project

After the required software is installed on your machine, follow these steps to install the project.

1. Download or clone the repository to your computer.
    ```
    git clone https://github.com/webis-de/lecture.js
    ```
    
2. Install all the required node modules by navigating to the `/lecture.js/` directory. Open the terminal inside and enter the following:
    ```
    node install
    ```
    Should the installation fail, you can try to do it manually. Navigate to the `/lecture.js/src/` directory, and open the terminal inside. Then enter the following command: `npm install` 
    
3. Check if the installation worked by navigating to the `/lecture.js/` directory. Open the terminal inside and enter the following:
    ```
    node lecture --version
    ```

# 3. Add credentials

Credentials are needed to access the APIs used by lecture.js. Of the following APIs, you **must** set up the credentials for **at least** one Text-to-speech API _(Google Cloud and/or Amazon Polly)_, or the pipeline won't work. Only the voices from the Text-to-speech APIs that are set up with credentials are useable.

## 3.1 Google Cloud

[![Google Cloud logo](img/logo_google_cloud_small.png)](#)

Google Cloud is required to use Google Cloud voices. For more information about the Google Cloud API, check out [this page](https://www.npmjs.com/package/@google-cloud/text-to-speech#before-you-begin).

To get credentials for the Google Cloud Text-to-Speech API, follow these steps:

1. Create a Google account.
2. Create a Google Cloud project [on this page](https://console.cloud.google.com/project).
3. Click on **Create Project** and create your project with a custom name.
4. Go to your [dashboard](https://console.cloud.google.com/home/dashboard) and open the project.
	*You may also open the project in the dropdown menu at the top of the Google Cloud Console page.*
5. Once you have the project opened, open the top-left navigation (☰) and click on [Billing].
	*If you can't find it, [this guide](https://cloud.google.com/billing/docs/how-to/modify-project#enable-billing) may help you.*
6. Click on **Link a billing account**, then in the newly opened window, click on **Create billing account**.
7. Select an account type (*Individual* should suffice) and add your payment information.
8. Now that the billing account is set up, enable the Google Cloud Text-to-Speech API [here](https://console.cloud.google.com/flows/enableapi?apiid=texttospeech.googleapis.com).
    	*Warning! Don't create a new project, but select your already created project in the dropdown menu!*
9. Back on your Dashboard, click on **Credentials** in the left navigation.
	*If you can't find it, you may be on the wrong Dashboard. If so, open the top-left navigation (☰) and click on **APIs & Services**, then on **Credentials**.*
10. Click on **Create Credentials** on top and select **Service account**.
11. On the new page, enter a name and click **Create**.
12. On the next page, select the **role** as **Project > Owner**. Complete the process and click on **Done**.
14. In the **Credentials** page, click on the service account;
15. On the new page, click on **Add key**, then **Create new key**, and select **JSON**.
16. The key will be downloaded as a JSON file.
17. Add the path to that credentials file to the lecture.js configuration at `/lecture.js/src/pipeline/config.ini`. Inside the configuration file, the Google Cloud credentials file is referenced under the section `credentials.google`.

## 3.2 Amazon Web Services

[![Amazon Web Services logo](img/logo_aws_small.png)](#)

Amazon Web Services is required to use Amazon Polly voices.

Now follow a few steps that will guide you through creating an Amazon Web Services account and getting your credentials. If the following installation steps aren't current anymore and something changed, please take a look at [this page](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html) instead.

1. Create a new AWS user account [here](https://console.aws.amazon.com/iam/).
    *(personal or professional account shouldn't matter)*
2. Add your payment information. (should be part of the signup process)
3. Select the basic plan, which is the free tier.
4. [Sign-in](https://signin.aws.amazon.com/) to your account as a root user.
5. Once signed in, in the navigation pane, click on **Users** / your account name.
6. In the dropdown menu, click on **My Security Credentials**.
7. In the tab **Access keys**, click on **Create New Access Key**.
8. After you created your key, click on **Show Access Key** to see your **Access Key ID** and **Secret Access Key**.
9. After you get your credentials, create a file with the following content:
    ```json
    {
        "accessKeyId" : "<YOUR_ACCESS_KEY_ID>", 
        "secretAccessKey" : "<YOUR_SECRET_ACCESS_KEY>"
    }
    ```
10. Add the path to that credentials file to the lecture.js configuration file at `/lecture.js/src/pipeline/config.ini`. Inside the configuration file, the path to the AWS credentials file is referenced under the section `credentials.aws`.

## 3.3 YouTube

[![YouTube logo](img/logo_youtube_small.png)](#)

Setting up credentials for YouTube is optional, but allows for a direct upload of your generated lectures to YouTube.

Follow the steps [here](https://developers.google.com/youtube/v3/quickstart/nodejs#step_1_turn_on_the) to get your credentials file. You need to add the path to that file to the lecture.js configuration at `/lecture.js/src/pipeline/config.ini`. Inside the configuration file, the path to the YouTube credentials file must be added under the section `credentials.youtube`.

You may need to request authentification/verification for the API in the Developer Console. Otherwise, uploads may become locked to private by YouTube, if the API is deemed untrustworthy.

# 4. Run the program

Click to learn [how to use](how-to-use.md) the software!