# Description

Microservice providing a lightweight API for generating PNG and PDF representations of a web page. Powered by [Node](https://nodejs.org/en/), [Express](https://expressjs.com/), [Electron](http://electron.atom.io/), and [Nightmare](http://www.nightmarejs.org/)

Includes a Dockerfile for running the microservice in an easy, headless, and isolated manner

# Installation with Docker

### Step 1: Acquire the image

- Option 1: Pull from Docker Hub
```
sudo docker pull binarydev/dreamcatcher:latest
```

- Option 2: Build Local Docker Image
```
sudo docker build -t <local-arbitrary-image-name> .
```
* Arguments:
  * **Local arbitrary image name:** Arbitrary name that will be used in step 2 for creating a Docker container

### Step 2: 

- Create a New Container With the Image
```
sudo docker run -d --restart=on-failure:3 -p <local-machine-port>:80 --name <arbitrary-container-name> <local-arbitrary-image-name>
```
* Arguments:
  * **Local machine port:** Arbitrary local port that will be forwarded to the exposed port 80 within the container
  * **Arbitrary container name:** Arbitrary name that will be assigned to the container for command reference and management
  * **Local arbitrary image name:** If you followed option 1 in step 1, enter "binarydev/dreamcatcher" here. If you followed option 2, use the arbitrary name you assigned in that step.
* Flags explained:
  * **-d** Run the container in detached mode, so that when the main process (the Express API server) exits, the container stops as well
  * **--restart=on-failure:3** If the main process exits with an error code, attempt to restart the container up to 3 times before aborting
  * **-p** Map a port on the host machine to the container's port 80, where the API server is listening
  * **--name** Give the container a name that you will use when referring to it for management

# Installation without Docker

### Prerequisites (only tested on OS X 10.10 and Ubuntu 16.04 LTS)

- NodeJS v4.4.4 LTS or higher
- NPM v2.15.1 or higher
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

#### Headlessly on a remote server (assuming you have installed Xvfb)
You can inspect start.sh in the repo to see how it sets up the virtual frame buffer and starts the server. Check the included Dockerfile to see what packages are required to run headlessly in an Ubuntu 16.04 LTS environment
```
chmod +x start.sh && ./start.sh 
```

# Usage

The microservice exposes a very simple API with 2 endpoints

### PNG Export

**Endpoint:** /export/png

**Parameters:** JSON request body with parameters (see below for options)

**Returns:** Binary image data that can be saved directly into a file

#### Options

- **url:** STRING - Target URL that you wish to export
- **width:** INTEGER - Width of browser viewport
- **height:** INTEGER - Height of browser viewport
- **fileName:** STRING - Name of the file as it should appear in the download
- **clipArea:** OBJECT - Define a specific area of the page to be captured for the PNG. If omitted, the entire visible area is captured
  - **x:** INTEGER
  - **y:** INTEGER
  - **width:** INTEGER
  - **height:** INTEGER

#### Example

```
POST http://localhost:8080/export/png
Content-Type: application/json

{ 
  "url":"http://google.com",
  "width":1000,
  "height":2000,
  "fileName":"google.png",
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
- **pdfOptions:** OBJECT - Same options as Electron's printToPDF function [found here](https://github.com/electron/electron/blob/v0.35.2/docs/api/web-contents.md#webcontentsprinttopdfoptions-callback)
  - **marginsType:** INTEGER - Specify the type of margins to use (0 - default, 1 - none, 2 - minimum)
  - **landscape:** BOOLEAN - Save PDF in Landscape (true - default) or Portrait (false) orientation
  - **pageSize:** STRING - Specify page size of the generated PDF (default: "Letter", other options include A3, A4, Legal, Tabloid)
  - **printBackground:** BOOLEAN - Include background graphics and colors (default: true)
  - **printSelectionOnly:** BOOLEAN - Whether to print selection only (default: false)

#### Example

```
POST http://localhost:8080/export/pdf
Content-Type: application/json

{ 
  "url":"http://google.com",
  "width":1000,
  "height":2000,
  "fileName":"google.pdf",
  "pdfOptions": {
    "landscape": true, 
    "printBackground": true,
    "pageSize": "Letter",
    "printSelectionOnly": false
  }
}
```
