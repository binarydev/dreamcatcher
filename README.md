- Build Local Docker Image
```
sudo docker build -t dreamcatcher_exporter .
```

- Create a New Container With the Image
```
sudo docker run -d -p 8080:80 --name dreamcatcher dreamcatcher_exporter
```

- Example Requests
```
POST /export/png HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: a9d6c445-1687-76b1-541c-d27d961e8aca

{ 
"url":"http://google.com",
"width":1000,
"height":2000,
"fileName":"IamHere.png"
}
```
```
POST /export/pdf HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: a9d6c445-1687-76b1-541c-d27d961e8aca

{ 
"url":"http://google.com",
"width":1000,
"height":2000,
"fileName":"IamHere.pdf"
}
```
