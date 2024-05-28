import { common } from "../../../../api/webpack";
import { Mod } from "../../../managers/plugins";
import { enable, disable, getExports } from "../../../managers/plugins";
import { Components } from "discord-types";

const { react: React, components: { Switch } } = common.modules;

export const PluginCard = ({ plugin }: Mod) => {
    const [isToggled, setIsToggled] = React.useState(false);

    React.useEffect(() => {
        const isEnabled = getExports(plugin.manifest.name)?.started;
        setIsToggled(!!isEnabled);
    }, [plugin]);

    const handleToggle = () => {
        if (isToggled) {
            disable(plugin.manifest.name);
        } else {
            enable(plugin.manifest.name);
        }
        setIsToggled(!isToggled);
    };

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
