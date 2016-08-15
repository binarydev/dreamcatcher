- Build Local Docker Image
```
sudo docker build -t dreamcatcher_exporter .
```

- Create a New Container With the Image
```
sudo docker run -d -p 8080:80 --name dreamcatcher dreamcatcher_exporter
```
