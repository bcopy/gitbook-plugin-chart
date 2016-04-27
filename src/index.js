
import { uuid } from './util';
import * as chartFns from './chart';

const FORMAT_YAML = 'yaml';

let chartScriptFn = () => {};

module.exports = {
    book: {
        assets: './assets'
    },
    hooks: {
        init: function () {
            let pluginConfig = (this.options.pluginsConfig || {}).chart || {};
            let type = pluginConfig.type;
            chartScriptFn = chartFns[type];
        }
    },
    blocks: {
        chart: {
            process: function (blk) {
                let id = uuid();
                let body = {};
                try {
                    // get string in {% chart %}
                    let bodyString = blk.body.trim();
                    if (blk.kwargs.format === FORMAT_YAML) {
                        // load yaml into body:
                        body = require('js-yaml').safeLoad(bodyString);
                    } else {
                        // just think it as json:
                        // TODO: Avoiding `eval`
                        // https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval
                        eval('body=' + bodyString);
                    }
                } catch (e) {
                    console.error(e);
                }
                let scripts = chartScriptFn(id, body);
                return `<div>
                    <div id="${id}"></div>
                    <script>${scripts}</script>
                </div>`;
            }
        }
    }
};
