- Build Local Docker Image
```
sudo docker build -t dreamcatcher_exporter .
```

- Create a New Container With the Image
```
sudo docker run -d -p <local-machine-port>:80 --name dreamcatcher_container dreamcatcher_exporter
```

- Example Requests (using local ports 8080 as the local-machine-port
```
POST /export/png HTTP/1.1
Host: localhost:<local-machine-port>
Content-Type: application/json

{ 
"url":"http://google.com",
"width":1000,
"height":2000,
"fileName":"IamHere.png"
}
```
```
POST /export/pdf HTTP/1.1
Host: localhost:<local-machine-port>
Content-Type: application/json

{ 
"url":"http://google.com",
"width":1000,
"height":2000,
"fileName":"IamHere.pdf"
}
```
