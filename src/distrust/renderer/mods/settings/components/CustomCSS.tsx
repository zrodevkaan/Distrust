import {modules} from '../../../../api/webpack/common';

const CustomCSSEditor = () => {
    modules.react.useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.5.3/ace.js";
        script.onload = () => {
            const editor = window.ace.edit("editor");
            editor.setTheme("ace/theme/cobalt");
            editor.session.setMode("ace/mode/css");
        };
        document.body.appendChild(script);
    }, []);

    return (
        <>
            <div className="editor-container">
                <div id="editor">// Program to reverse a string</div>
            </div>
        </>
    );
};

export default CustomCSSEditor;