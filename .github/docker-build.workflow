workflow "Build and deploy docker image on push" {
  on = "push"
  resolves = [
    "Docker Push",
  ]
}

action "Filters for GitHub Actions" {
  uses = "actions/bin/filter@b2bea07"
  args = "branch master"
}

action "GitHub Action for Docker" {
  uses = "actions/docker/cli@76ff57a"
  needs = ["Filters for GitHub Actions"]
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
