export const injectCSS = (id: string, css: string): void =>
{
    if (document.readyState === 'loading')
    {
        const inject = () =>
        {
            injectCSS(id, css)
            document.removeEventListener('DOMContentLoaded', inject)
        }

        document.addEventListener('DOMContentLoaded', inject);

        return;
    }

    let style = document.getElementById(id) as HTMLStyleElement;

    if (!style)
    {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
    }

    if (style.textContent !== css) style.textContent = css;
};

export const uninjectCSS = (name: string): void => document.getElementById(name)?.remove?.()

export const getInnerCSS = (name: string): string => document.getElementById(name)?.innerHTML || '';