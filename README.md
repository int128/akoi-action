# akoi-action

This is an action to install packages using https://github.com/suzuki-shunsuke/akoi.


## Getting Started

Define packages in `.akoi.yml`.

```yaml
bin_path: '{{.Name}}-{{.Version}}'
link_path: '{{.Name}}'

packages:
  # just an example
  github-comment:
    url: https://github.com/suzuki-shunsuke/github-comment/releases/download/{{.Version}}/github-comment_{{trimPrefix "v" .Version}}_{{.OS}}_{{.Arch}}.tar.gz
    version: v3.0.1
    files:
      - name: github-comment
        archive: github-comment
```

To install the packages:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: int128/akoi-action@main
```

You can set a path to akoi config.

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: int128/akoi-action@main
        with:
          config: your-app/.akoi.yml
```
