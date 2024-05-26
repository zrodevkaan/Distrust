import {modules} from '../../../../api/webpack/common';
import {injectCSS, uninjectCSS} from "../../../../api/css";
import {generalSettings} from "../../../../devConsts";
import {getKeys} from "../../../../api/webpack/getters";

const Modals = getKeys('Anchor');
const {FormSwitch} = getKeys('FormSwitch');

const CustomCSSEditor = () => {
    const [editorContent, setEditorContent] = modules.react.useState("/* Put your css here ;3 Not putting any css will do harm to my heart :( */");
    const [liveUpdate, setLiveUpdate] = modules.react.useState(false);

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.5.3/ace.js";
    script.id = "aceEditor";

    modules.react.useEffect(() => {
        const loadEditor = async () => {
            document.getElementById("aceEditor")?.remove?.();
            // god this is so lazy.
            script.onload = async () => {
                const editor = window.ace.edit("editor");
                editor.setOptions({
                    // maxLines: Infinity,  // this is going to be very slow on large documents
                    useWrapMode: true,
                    indentedSoftWrap: true,
                    behavioursEnabled: true,
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: false
                    // showLineNumbers: false, // hide the gutter
                    // theme: "ace/theme/xcode"
                });
                editor.setTheme("ace/theme/cobalt");
                editor.session.setMode("ace/mode/css");
                const savedCss = await generalSettings.get('customCss');
                editor.session.setValue(savedCss ?? editorContent);
                setEditorContent(savedCss ?? editorContent);
                editor.session.on("change", function () {
                    const newContent = editor.getValue();
                    setEditorContent(newContent);
                    void generalSettings.set('customCss', newContent);
                });
            };
            document.body.appendChild(script);

            const liveUpdateSetting = await generalSettings.get('liveUpdateCss');
            setLiveUpdate(liveUpdateSetting);
        };

        void loadEditor();
    }, []);

    modules.react.useEffect(() => {
        const updateLiveCSS = async () => {
            if (liveUpdate) {
                injectCSS('customCss', editorContent);
            }
        };

        void updateLiveCSS();
    }, [editorContent, liveUpdate]);

    const handleToggleLiveUpdate = async () => {
        const newLiveUpdate = !liveUpdate;
        setLiveUpdate(newLiveUpdate);
        await generalSettings.set('liveUpdateCss', newLiveUpdate);
    };

    return (
        <>
            <div className="editor-container">
                <div id="editor">
                    /* Put your css here ;3 Not putting any css will do harm to my heart :( */
                </div>
            </div>
            <FormSwitch
                note="Toggle live update for custom CSS"
                value={liveUpdate}
                onChange={handleToggleLiveUpdate}
            >
                Live Update CSS
            </FormSwitch>
            <Modals.Button onClick={() => injectCSS('customCss', editorContent)}>
                Update CSS
            </Modals.Button>
        </>
    );
};

export default CustomCSSEditor;
