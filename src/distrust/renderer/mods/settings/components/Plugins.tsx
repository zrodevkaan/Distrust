import { common } from "../../../../api/webpack";
import { Mod } from "../../../managers/plugins";
import { enable, disable, getPlugin } from "../../../managers/plugins";

const { react: React, components: { Switch } } = common.modules;

export const PluginCard = ({ plugin }: { plugin: Mod }) => {
    const [isToggled, setIsToggled] = React.useState(false);

    React.useEffect(() => {
        setIsToggled(Boolean(getPlugin(plugin.manifest.name)?.started));
    }, [plugin]);

    const handleToggle = () =>
        (isToggled ? disable(plugin.manifest.name) : enable(plugin.manifest.name))
            .then(() => setIsToggled(!isToggled));

    return (
        <div style={{ marginBottom: '10px' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
                <div className="topper">
                    <div className="info-topper">
                        <h3><strong>{plugin.manifest.name}</strong></h3>
                        <span className="small-text">{plugin.manifest.authors.join(", ")}</span>
                        <span className="small-text">v{plugin.manifest.version}</span>
                        <Switch checked={isToggled} onChange={handleToggle}/>
                    </div>
                </div>
                <p>{plugin.manifest.description}</p>
            </div>
        </div>
    );
};