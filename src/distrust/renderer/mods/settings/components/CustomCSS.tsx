import { modules } from '../../../../api/webpack/common';
import { injectCSS } from "../../../../api/css";
import { generalSettings } from "../../../../devConsts";
import { getKeys } from "../../../../api/webpack/getters";

const { react: React, ace } = modules;

const Modals = getKeys('Anchor');
const { FormSwitch } = getKeys('FormSwitch');

const CustomCSSEditor = ({ settingName, onUpdateCSS, startingValue }) => {
    const [editorContent, setEditorContent] = React.useState("/* Put your css here ;3 Not putting any css will do harm to my heart :( */");
    const [liveUpdate, setLiveUpdate] = React.useState(false);

    React.useEffect(() => {
        const loadEditor = async () => {
            const editor = ace.edit("editor");

            editor.setTheme("ace/theme/pastel_on_dark");
            editor.session.setMode("ace/mode/css");

            const savedCss = await generalSettings.get(settingName);

            if (startingValue) {
                editor.session.setValue(startingValue);
                setEditorContent(startingValue);
            } else {
                editor.session.setValue(savedCss ?? editorContent);
                setEditorContent(savedCss ?? editorContent);
            }

            // editor.session.setValue(savedCss ?? editorContent);
            // setEditorContent(savedCss ?? editorContent);

            editor.session.on("change", () =>
            {
                const newContent = editor.getValue();
                setEditorContent(newContent);
                void generalSettings.set(settingName, newContent);
                if (onUpdateCSS) onUpdateCSS(newContent);
            });

            const liveUpdateSetting = await generalSettings.get('liveUpdateCss');
            setLiveUpdate(liveUpdateSetting);
        };

        void loadEditor();
    }, []);

    React.useEffect(() => {
        if (liveUpdate)
            injectCSS(settingName, editorContent);
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
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                <Modals.Button onClick={() => injectCSS(settingName, editorContent)}>
                    Update CSS
                </Modals.Button>
            </div>
        </>
    );
};

export default CustomCSSEditor;
