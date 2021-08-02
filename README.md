# akoi-action [![ts](https://github.com/int128/akoi-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/akoi-action/actions/workflows/ts.yaml)

This is an action to install packages using https://github.com/suzuki-shunsuke/akoi.

This version v2 is written in TypeScript.
v1 is still available in [v1 branch](https://github.com/int128/akoi-action/tree/v1).


## Getting Started

Create `.akoi.yml` and add packages.

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

**NOTE**: you need to set `bin_path` and `link_path` as above.

To install the packages:

```yaml
jobs:
  test:
    steps:
      - uses: actions/checkout@v2
      - uses: int128/akoi-action@v2
```

This action downloads the packages into directory `.akoi/{digest of .akoi.yml}` and saves it to cache.
It restores the packages from cache next time.

You can set a path to akoi config.

```yaml
jobs:
  test:
    steps:
      - uses: actions/checkout@v2
      - uses: int128/akoi-action@v2
        with:
          config: path/to/.akoi.yml
```


## Inputs

| Name | Default | Description
|------|---------|------------
| `config` | `${{ github.workspace }}/.akoi.yml` | path to akoi config
| `version` | see action.yaml | akoi version


## Outputs

| Name | Description
|------|------------
| `directory` | path to binary directory
