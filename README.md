# grafana-annotation-action <a href="https://github.com/pureskillgg/psgg-grafana-annotation-action/actions"><img alt="status" src="https://github.com/pureskillgg/psgg-grafana-annotation-action/workflows/CI/badge.svg"></a> [![Latest Stable Version](https://img.shields.io/github/v/release/pureskillgg/psgg-grafana-annotation-action?)](https://github.com/pureskillgg/psgg-grafana-annotation-action/releases)

GitHub Action for Grafana annotations.

> Branched from the archived [grafana-annotation-actions](https://github.com/marketplace/actions/grafana-annotation-actions) action. Maintained by [@billfreeman44](https://github.com/billfreeman44).

![Example Image](images/example.png)

## Creating an annotation and updating the end time after some actions.

```yaml
jobs:
  example:
    name: example job
    runs-on: ubuntu-latest
    steps:
      - name: Add Grafana annotation
        id: grafana
        uses: pureskillgg/psgg-grafana-annotation-action@v1
        with:
          grafanaHost: "https://grafana.example.com"
          grafanaToken: ${{ secrets.GRAFANA_TOKEN }}
          grafanaText: |
            This is an example of the text that
            will be present on the annotation
          grafanaTags: |
            type:performance
            service:sre-smart-scaling-api
      - name: Action that takes some time
        run: sleep 30
      - name: Update Grafana annotation
        uses: pureskillgg/psgg-grafana-annotation-action@v1
        with:
          grafanaHost: "https://grafana.example.com"
          grafanaToken: ${{ secrets.GRAFANA_TOKEN }}
          grafanaAnnotationID: ${{ steps.grafana.outputs.annotation-id }} # Output from previous usage of action
```

### Parameters

* `grafanaHost` **Required**: The Grafana API host.
* `grafanaToken` **Required**: The Grafana API authentication token.
* `grafanaText` **Required** when creating, optional when updating: The Grafana annotation text.
* `grafanaDashboardID` **Optional**: Used to target a specific dashboard panel alongside `grafanaPanelID`.
* `grafanaPanelID` **Optional**: Used to target a specific panel alongside `grafanaDashboardID`.
* `grafanaTags` **Optional**: Newline separated tags that will be sent with the annotation.
* `grafanaAnnotationID` **Optional**: If supplied, an existing annotation will be updated with the current time as its end time.
