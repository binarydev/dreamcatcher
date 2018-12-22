workflow "Build and deploy docker image on push" {
  on = "push"
  resolves = [
    "Docker Push",
    "Docker Tag",
  ]
}

action "Filters for GitHub Actions" {
  uses = "actions/bin/filter@b2bea07"
  args = "branch master"
}

action "Docker Build" {
  uses = "actions/docker/cli@76ff57a"
  needs = ["Filters for GitHub Actions"]
  args = "build --rm -t binarydev/dreamcatcher ."
}

action "Docker Registry" {
  uses = "actions/docker/login@76ff57a"
  secrets = ["DOCKER_PASSWORD", "DOCKER_USERNAME"]
  needs = ["Docker Build"]
}

action "Docker Push" {
  uses = "actions/docker/cli@76ff57a"
  needs = ["Docker Tag"]
  args = "push binarydev/dreamcatcher:$IMAGE_SHA"
}

action "Docker Tag" {
  uses = "actions/docker/tag@76ff57a"
  needs = ["Docker Registry"]
  args = "binarydev/dreamcatcher binarydev/dreamcatcher --no-ref --no-latest --env"
}
