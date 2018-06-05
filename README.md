# Description

Microservice providing a lightweight API for generating PNG and PDF representations of a web page. Powered by [Node](https://nodejs.org/en/), [Express](https://expressjs.com/), [Electron](http://electron.atom.io/), and [Nightmare](http://www.nightmarejs.org/)

Includes a Dockerfile for running the microservice in an easy, headless, and isolated manner. The image uses the binarydev/docker-ubuntu-with-xvfb:latest base image, which can be recreated from [this Dockerfile](https://github.com/binarydev/docker-ubuntu-with-xvfb).

# NOTES:

## PDF Rendering and Docker Shared Memory Size
- If running within a Docker container in privileged mode, the container's default process (start.sh) unmounts and deletes /dev/shm in order to replace it with a larger 1GB shared memory mount to ensure PDF rendering is successful at larger file sizes. The same can be accomplished without privileged mode for security purposes by using the --shm-size flag for Docker's run command (e.g. "--shm-size=1G")

## Custom Fonts for Rendering
- The start.sh bash script checks for an environment variable named $FONT_ZIP_URLS. This should be a string variable in your environment with space-separated URLs of zip files containing your custom fonts. The variable can be set as part of the start.sh call (```FONT_ZIP_URLS="http://url1 http://url2" ./start.sh```) or in your local session using the export command. If you are running this microservice in a Docker container, you can set this environment variable during your docker run command (see Docker installation notes below).

# Installation with Docker

### Step 1: Acquire the image

- Option 1: Pull from Docker Hub
```
sudo docker pull binarydev/dreamcatcher:latest
```

- Option 2: Clone Repo and Build Local Docker Image
```
git clone https://github.com/binarydev/dreamcatcher.git
cd dreamcatcher
sudo docker build -t <local-arbitrary-image-name> .
```
* Arguments:
  * **Local arbitrary image name:** Arbitrary name that will be used in step 2 for creating a Docker container

### Step 2: 

- Create a New Container With the Image
```
sudo docker run -d --restart=on-failure:3 --shm-size=1G -p <local-machine-port>:80 --env FONT_ZIP_URLS="http://url1 http://url2 http://etc" --name <arbitrary-container-name> <local-arbitrary-image-name>
```
* Arguments:
  * **Local machine port:** Arbitrary local port that will be forwarded to the exposed port 80 within the container
  * **Arbitrary container name:** Arbitrary name that will be assigned to the container for command reference and management
  * **Local arbitrary image name:** If you followed option 1 in step 1, enter "binarydev/dreamcatcher" here. If you followed option 2, use the arbitrary name you assigned in that step.
* Flags explained:
  * **-d** Run the container in detached mode, so that when the main process (the Express API server) exits, the container stops as well
  * **--restart=on-failure:3** If the main process exits with an error code, attempt to restart the container up to 3 times before aborting
  * **--shm-size=1G** Define the amount of shared memory for the container. The Docker default is 64mb, which is too small for rendering PDFs with any reasonable amount of content, since the browser environment renders the PDF into shared memory for generation. We recommend at least 1G (1 gigabyte), but you can tweak this as you see fit for your needs. Alternatively, you can skip this flag and run the container in privileged mode (--privileged) and the start.sh script within it will automatically allocate and mount a 1GB shared memory device
  * **--env FONT_ZIP_URLS="http://url1 http://url2 http://etc"** Set a custom environment variable within the container, which in this case is the FONT_ZIP_URLS variable containing a list of space-delimited URLs for zip files containing fonts that the container will fetch and install within the container. Since container file systems are ephemeral, this font installation process will execute every time the container is started as long as this variable is set to anything except an empty string. The STDOUT of the container will show the current state of font installation during start up.
  * **-p** Map a port on the host machine to the container's port 80, where the API server is listening
  * **--name** Give the container a name that you will use when referring to it for management

# Installation without Docker

### Prerequisites (only tested on OS X 10.10 and Ubuntu 16.04 LTS and 16.10)

- NodeJS v6.9.1 LTS or higher
- NPM v3.10.8 or higher
- Xvfb (optional on localhost, but mandatory on servers to run headlessly)

### Step 1: Clone/download the repo

```
git clone https://github.com/binarydev/dreamcatcher.git
```

### Step 2: Install necessary packages
```
npm install
```

### Step 3: Start microservice
#### Locally:
```
npm start
```

#### Headlessly on a remote server (assuming you have installed Xvfb, and does not apply to macOS)
You can inspect start.sh in the repo to see how it sets up the virtual frame buffer and starts the server. Check the included Dockerfile to see what packages are required to run headlessly in an Ubuntu 16.04 LTS environment
```
chmod +x start.sh && ./start.sh 
```

# Usage

After using the ```sudo docker run``` command above, the container will have automatically started and is ready for use.

After a cold boot or a restart, be sure to run ```sudo docker start <arbitrary-container-name>``` where ```<arbitrary-container-name>``` is the name you entered when first creating the container. This will kickstart the container in the background so it's ready to process any of your requests.

When trying to access your localhost, such as when running a local dev server that you would like Dreamcatcher to hit for export testing, you should use your machine's external facing IP address. As a result, a typical URL of http://localhost:3000 for a Rails server would become http://<EXTERNAL-IP-ADDRESS>:3000 when sending it to the Dreamcatcher server. This is because the default Docker network stack designates your machine as a gateway, and not as a host with exposed ports for access via the visible Gateway IP.

The Dreamcatcher microservice itself exposes a very simple API with 3 endpoints:

### Status Check

**Endpoint:** /status

**Returns:** Status code 200 OK in the headers and an irrelevant string in the body. This is only meant to be used for service monitoring, so that you can restart the service or trigger alerts if you receive anything other than a 200 OK status code.

### PNG Export

**Endpoint:** /export/png

**Parameters:** JSON request body with parameters (see below for options)

**Returns:** Binary image data that can be saved directly into a file

#### Options

- **url:** STRING - Target URL that you wish to export
- **width:** INTEGER - Width of browser viewport
- **height:** INTEGER - Height of browser viewport
- **fileName:** STRING - Name of the file as it should appear in the download
- **selector:** STRING - The CSS selector you want to use for querying the view dimensions
- **waitFor:** ARRAY(String selector, Integer time in milliseconds, or Function that can be executed repeatedly until it returns true) - Optional Argument, an array of values that defines what browser should wait for before proceeding to generate the PDF and PNG. By using an array, you can chain wait commands (e.g. wait for #my-id, then wait 5 seconds) (default: null)
- **htmlContent** STRING - Optional Argument, any HTML content that you would like to have rendered for export. *NOTE:* By passing in this parameter, any provided value for the URL parameter above will be ignored. (default: null)
- **clipArea:** OBJECT - Define a specific area of the page to be captured for the PNG. If omitted, the entire visible area is captured
  - **x:** INTEGER
  - **y:** INTEGER
  - **width:** INTEGER - Optional Argument, will use body.offsetWidth if not supplied
  - **height:** INTEGER - Optional Argument, will use body.offsetHeight if not supplied
- **headers:** OBJECT - Optional Argument. Allows you to add cookies for authentication, or any other header your server might need.

#### Example

```
POST http://localhost:8080/export/png
Content-Type: application/json

{ 
  "url":"http://google.com",
  "width":1000,
  "height":2000,
  "fileName":"google.png",
  "waitFor":[".last-rendered-item", 500],
  "htmlContent": "<h1>This will cause the URL to be ignored</h1>",
  "clipArea": { 
    "x": 100,
    "y": 100,
    "width": 150,
    "height": 200
  }
}
```


### PDF Export

**Endpoint:** /export/pdf

**Parameters:** JSON request body with parameters (see below for options)

**Returns:** Binary PDF data that can be saved directly into a file

#### Options

- **url:** STRING - Target URL that you wish to export
- **width:** INTEGER - Width of browser viewport
- **height:** INTEGER - Height of browser viewport
- **fileName:** STRING - Name of the file as it should appear in the download
- **selector:** STRING - The CSS selector you want to use for querying the view dimensions
- **waitFor:** ARRAY(String selector, Integer time in milliseconds, or Function that can be executed repeatedly until it returns true) - Optional Argument, an array of values that defines what browser should wait for before proceeding to generate the PDF and PNG. By using an array, you can chain wait commands (e.g. wait for #my-id, then wait 5 seconds) (default: null)
- **htmlContent** STRING - Optional Argument, any HTML content that you would like to have rendered for export. *NOTE:* By passing in this parameter, any provided value for the URL parameter above will be ignored. (default: null)
- **pdfOptions:** OBJECT - Same options as Electron's printToPDF function [found here](https://github.com/electron/electron/blob/v0.35.2/docs/api/web-contents.md#webcontentsprinttopdfoptions-callback)
  - **marginsType:** INTEGER - Optional Argument, specify the type of margins to use (0 - default, 1 - none, 2 - minimum)
  - **landscape:** BOOLEAN - Optional Argument, save PDF in Landscape (true - default) or Portrait (false) orientation
  - **pageSize:** STRING - Optional Argument, specify page size of the generated PDF (default: "Letter", other options include A3, A4, Legal, Tabloid)
  - **printBackground:** BOOLEAN - Optional Argument, include background graphics and colors (default: true)
  - **printSelectionOnly:** BOOLEAN - Optional Argument, whether to print selection only (default: false)

#### Example

```
POST http://localhost:8080/export/pdf
Content-Type: application/json

{ 
  "url":"http://google.com",
  "width":1000,
  "height":2000,
  "fileName":"google.pdf",
  "waitFor":[".last-rendered-item", 500],
  "htmlContent": "<h1>This will cause the URL to be ignored</h1>",
  "pdfOptions": {
    "landscape": true, 
    "printBackground": true,
    "pageSize": "Letter",
    "printSelectionOnly": false
  }
}
```

**NOTE:** You are responsible for disabling scrollbars through CSS on the page you are rendering. This can be done by placing this style in your `<head>`:

```
<style>
  ::-webkit-scrollbar { display: none; }
</style>
```
