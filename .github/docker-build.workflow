workflow "New workflow" {
  on = "push"
  resolves = ["Docker Push"]
}

action "GitHub Action for Docker" {
  uses = "actions/docker/cli@76ff57a"
  args = "build --rm -t binarydev/dreamcatcher:$(git rev-parse --short HEAD) ."
}

action "Docker Registry" {
  uses = "actions/docker/login@76ff57a"
  needs = ["GitHub Action for Docker"]
  secrets = ["DOCKER_PASSWORD", "DOCKER_USERNAME"]
}

action "Docker Push" {
  uses = "actions/docker/cli@76ff57a"
  needs = ["Docker Registry"]
  args = "push build -t binarydev/dreamcatcher:$(git rev-parse --short HEAD)"
}
