﻿import {modules} from '../../../../api/webpack/common';
import {injectCSS, uninjectCSS} from "../../../../api/css";
import {generalSettings} from "../../../../devConsts";

const CustomCSSEditor = () => {
    const [editorContent, setEditorContent] = modules.react.useState(void generalSettings.get('customCss') ?? "/* Put your css here ;3 Not putting any css will do harm to my heart :( */");

    modules.react.useEffect(() => {
        document.getElementById("aceEditor")?.remove?.();
        // god this is so lazy.
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.5.3/ace.js";
        script.id = "aceEditor"
        script.onload = async () => {
            const editor = window.ace.edit("editor");
            editor.setTheme("ace/theme/cobalt");
            editor.session.setMode("ace/mode/css");
            editor.session.setValue(await generalSettings.get('customCss'))
            editor.session.on("change", function () {
                const newContent = editor.getValue();
                setEditorContent(newContent);
                void generalSettings.set('customCss', newContent)
            });
        };
        document.body.appendChild(script);

        return () => {
            uninjectCSS('customCss');
        };
    }, []);

    modules.react.useEffect(() => {
        injectCSS('customCss',editorContent);
    }, [editorContent]);

    return (
        <div className="editor-container">
            <div id="editor">/* Put your css here ;3 Not putting any css will do harm to my heart :( */</div>
        </div>
    );
};

export default CustomCSSEditor;