import {React} from "../modules/discordModules";

export const PluginCard = ({ plugin }) => {
    const [isToggled, setIsToggled] = React.useState(false);

    return (
        <div style={{ marginBottom: '10px' }}>
            <div className="card" onClick={() => setIsToggled(!isToggled)} style={{ cursor: 'pointer' }}>
                <div className="info">
                    <h3><strong>{plugin.manifest.name}</strong></h3>
                    <p>{plugin.manifest.authors.join(", ")}</p>
                    <p>{plugin.manifest.version}</p>
                </div>
                <p>{plugin.manifest.description}</p>
            </div>
        </div>
    );
};