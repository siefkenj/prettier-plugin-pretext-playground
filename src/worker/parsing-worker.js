import * as Comlink from "comlink";
import Prettier from "prettier/esm/standalone.mjs";
import prettierPluginPretext from "prettier-plugin-pretext";


// Needed to print the prettier Doc
import prettierPluginBabel from "prettier/parser-babel";
import globalthisgenrator from "globalthis";

console.log("The Plugin", prettierPluginPretext);
/**
 * Format `source` LaTeX code using Prettier to format/render
 * the code.
 *
 * @export
 * @param [source=""] - code to be formatted
 * @param [options={}] - Prettier options object (you can set `printWidth` here)
 * @returns formatted code
 */
export function printPrettier(source = "", options = {}) {
    return Prettier.format(source, {
        printWidth: 80,
        useTabs: true,
        ...options,
        parser: "ptx",
        plugins: [prettierPluginPretext],
    });
}

// XXX globalThis needs a polyfill, otherwise CRA will silently error on build!
var globalThis = globalthisgenrator();

const obj = {
    format(texInput, options = {}) {
        const output = printPrettier(texInput, options);

        return output;
    },
    parseToDoc(texInput, options = {}) {
        const doc = Prettier.__debug.printToDoc(texInput, {
            ...options,
            parser: "ptx",
            plugins: [prettierPluginPretext],
        });

        const output = Prettier.__debug.formatDoc(doc, {
            parser: "babel",
            plugins: [prettierPluginBabel],
        });

        return output;
    },
};

Comlink.expose(obj);
