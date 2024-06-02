import { modules } from '../../../../api/webpack/common';
import { injectCSS, uninjectCSS } from "../../../../api/css";
import { generalSettings } from "../../../../devConsts";
import {getKeys} from "../../../../api/webpack/getters";

const { react: React } = modules;

const Modals = getKeys('Anchor');
const { FormSwitch } = getKeys('FormSwitch');

const CustomCSSEditor = () =>
{
    const [editorContent, setEditorContent] = modules.react.useState("/* Put your css here ;3 Not putting any css will do harm to my heart :( */");
    const [liveUpdate, setLiveUpdate] = modules.react.useState(false);

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.5.3/ace.js";
    script.id = "aceEditor";

    React.useEffect(() =>
        {
            const loadEditor = async () =>
            {
                document.getElementById("aceEditor")?.remove?.();
                // god this is so lazy.
                script.onload = async () =>
                {
                    const editor = window.ace.edit("editor");

                    editor.setTheme("ace/theme/pastel_on_dark");
                    editor.session.setMode("ace/mode/css");

                    const savedCss = await generalSettings.get('customCss');

                    editor.session.setValue(savedCss ?? editorContent);
                    setEditorContent(savedCss ?? editorContent);

                    editor.session.on("change", () =>
                    {
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
        },
        [],
    );

    React.useEffect(() =>
        {
            const updateLiveCSS = async () =>
            {
                if (liveUpdate)
                    injectCSS('customCss', editorContent);
            };

            void updateLiveCSS();
        },
        [editorContent, liveUpdate],
    );

    const handleToggleLiveUpdate = async () =>
    {
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
            <div style={{display: "flex", justifyContent: "center", marginBottom: "10px"}}>
                <Modals.Button onClick={() => injectCSS('customCss', editorContent)}>
                    Update CSS
                </Modals.Button>
            </div>
        </>
    );
};

export default CustomCSSEditor;
