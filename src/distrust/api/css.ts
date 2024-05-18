
export const injectCSS = (id: string, css: string): void => {
    const inject = () => {
        let el = document.getElementById(id) as HTMLStyleElement;
        if (!el) {
            el = document.createElement('style');
            el.id = id;
            document.head.appendChild(el);
        }
        if (el.textContent !== css) el.textContent = css;
    };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', inject) : inject();
};



export const uninjectCSS = (name: string): void => {
    const style = document.getElementById(name);
    if (style) {
        document.head.removeChild(style);
    }
};