import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "codemirror/lib/codemirror.css";
import SplitPane from "react-split-pane";
import "codemirror/addon/display/rulers";
//import * as latexAstParser from "latex-ast-parser";

import "./App.css";

import { CodeMirrorPanel } from "./CodeMirrorPanel.js";

import * as Comlink from "comlink";
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from "worker-loader!./worker/parsing-worker";

import { DebugView } from "./DebugView";

const DEFAULT_INPUT_TEXT = String.raw`
<section>
<p>A video is a <br /> natural way to</p>
<p>A video is a natural <br /> way to enhance a document when rendered in an electronic format, such as HTML web pages. It might be additional information that is hard to communicate with text (marine invertebrates swimming), a</p>
<p>Some <trademark /> text <m>math and stuff</m>. and <ul><li>foo</li><li>bar</li></ul> and more textsuch as HTML web pages. It might be additional information that is hard to communicate with text (marine invertebrates swimming), a</p>
<sage><output>This is     verbatim. No spacing will be adjusted    </output><input>
                A = matrix(4,5, srange(20))
                 A.rref()
    </input>
</sage>
<p>fun times<ul><li>foo</li><li>bar</li></ul>with list</p>
<p>fun times<ul><li>foo</li><li>bar</li></ul>
    
    with list</p>
</section>
`;

// Our worker that will format code in another thread.
const worker = new Worker();
const asyncFormatter = Comlink.wrap(worker);

function App() {
    const [textWidth, setTextWidth] = React.useState(80);
    const [currDisplay, setCurrDisplay] = React.useState("formatted");
    const [texInput, setTexInput] = React.useState(DEFAULT_INPUT_TEXT);
    const [texOutput, setTexOutput] = React.useState("");
    const [prettierDoc, setPrettierDoc] = React.useState("");
    const [applyLints, setApplyLints] = React.useState(false);
    const [showLints, setShowLints] = React.useState(false);

    React.useEffect(() => {
        switch (currDisplay) {
            case "formatted":
                if (applyLints) {
                    asyncFormatter
                        .formatWithLints(texInput, { printWidth: textWidth })
                        .then((x) => setTexOutput(x))
                        .catch((e) => console.warn("Failed to parse", e));
                } else {
                    asyncFormatter
                        .format(texInput, { printWidth: textWidth })
                        .then((x) => setTexOutput(x))
                        .catch((e) => console.warn("Failed to parse", e));
                }
                break;
            case "ast":
            case "doc":
                asyncFormatter
                    .parseToDoc(texInput)
                    .then((x) => setPrettierDoc(x))
                    .catch((e) => console.warn("Failed to parse", e));
                break;
            default:
                break;
        }
    }, [texInput, textWidth, currDisplay, showLints, applyLints]);

    let rightPanel = null;
    if (currDisplay === "formatted") {
        rightPanel = (
            <CodeMirror
                value={texOutput}
                options={{ mode: "xml", rulers: [textWidth] }}
                onBeforeChange={(editor, data, value) => setTexOutput(value)}
            />
        );
    }
    if (currDisplay === "ast") {
    }
    if (currDisplay === "doc") {
        rightPanel = (
            <CodeMirror value={prettierDoc} options={{ mode: "javascript" }} />
        );
    }
    if (currDisplay === "debug") {
        rightPanel = <DebugView texInput={texInput} textWidth={textWidth} />;
    }

    return (
        <div className="App">
            <div className="options-bar">
                <input
                    type="number"
                    value={textWidth}
                    onChange={(e) => setTextWidth(parseInt(e.target.value, 10))}
                />{" "}
                Display:{" "}
                <select
                    onChange={(e) => setCurrDisplay(e.target.value)}
                    value={currDisplay}
                >
                    <option value="formatted">Formatted Code</option>
                    <option value="doc">
                        Prettier Doc (AST for formatting)
                    </option>
                </select>{" "}
                <label>
                    Show Lints:{" "}
                    <input
                        name="showLints"
                        type="checkbox"
                        checked={showLints}
                        onChange={(e) => setShowLints(e.target.checked)}
                    />
                </label>
                <label>
                    {" "}
                    Apply Lints:{" "}
                    <input
                        name="applyLints"
                        type="checkbox"
                        checked={applyLints}
                        onChange={(e) => {
                            setApplyLints(e.target.checked);
                            if (e.target.checked) {
                                setShowLints(true);
                            }
                        }}
                    />
                </label>
            </div>
            <div className="tex-section">
                <SplitPane split="vertical" minSize={200} defaultSize="50%">
                    <div className="code-container">
                        <CodeMirrorPanel
                            lineNumbers={true}
                            showCursorWhenSelecting={true}
                            tabSize={4}
                            rulerColor="#eeeeee"
                            mode="xml"
                            value={texInput}
                            onChange={setTexInput}
                            codeSample={DEFAULT_INPUT_TEXT}
                        />
                    </div>
                    <div className="code-container">{rightPanel}</div>
                </SplitPane>
            </div>
        </div>
    );
}

export default App;
