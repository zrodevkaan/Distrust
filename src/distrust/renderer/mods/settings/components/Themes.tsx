import { common } from "../../../../api/webpack";
import { Theme } from "../../../managers/themes";
import { enable, disable, getTheme } from "../../../managers/themes";
import { Components } from "discord-types";

const { react: React, components: { Switch } } = common.modules;

export const ThemeCard = ({ theme }: { theme: Theme }) =>
{
    const [isToggled, setIsToggled] = React.useState(false);

    React.useEffect(() =>
        {
            setIsToggled(Boolean(getTheme(theme.manifest.name)?.started));
        },
        [theme],
    );

    const handleToggle = () =>
        (isToggled ? disable(theme.manifest.name) : enable(theme.manifest.name))
            .then(() => setIsToggled(!isToggled));

    return (
        <div style={{ marginBottom: '10px' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
                <div className="info">
                    <h3><strong>{theme.manifest.name}</strong></h3>
                    <p>{(theme.manifest.authors || ['Unknown']).join(", ")}</p>
                    <p>{(theme.manifest.version || '0.0.0')}</p>
                </div>
                <p>{theme.manifest.description}</p>
                <Switch checked={isToggled} onChange={handleToggle} />
            </div>
        </div>
    );
};
