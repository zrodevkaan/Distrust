import { common } from "../../../../api/webpack";
import { Mod } from "../../../managers/plugins";
import { enable, disable, getPlugin } from "../../../managers/plugins";

const { react: React, components: { Switch } } = common.modules;

export const PluginCard = ({ plugin }: { plugin: Mod }) => {
    const [isToggled, setIsToggled] = React.useState(false);

    React.useEffect(() =>
        {
            setIsToggled(Boolean(getPlugin(plugin.manifest.name)?.started));
        },
        [plugin],
    );

    const handleToggle = () =>
        (isToggled ? disable(plugin.manifest.name) : enable(plugin.manifest.name))
            .then(() => setIsToggled(!isToggled));

    return (
        <div style={{ marginBottom: '10px' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
                <div className="info">
                    <h3><strong>{plugin.manifest.name}</strong></h3>
                    <p>{plugin.manifest.authors.join(", ")}</p>
                    <p>{plugin.manifest.version}</p>
                </div>
                <p>{plugin.manifest.description}</p>
                <Switch checked={isToggled} onChange={handleToggle} />
            </div>
        </div>
    );
};
