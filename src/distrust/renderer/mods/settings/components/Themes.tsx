import { common } from "../../../../api/webpack";
import { Theme } from "../../../managers/themes";
import { enable, disable, getExports } from "../../../managers/themes";

const { react: React } = common.modules;

export const ThemeCard = ({ theme }: { theme: Theme }) => {
    const [isToggled, setIsToggled] = React.useState(false);

    React.useEffect(() => {
        const isEnabled = getExports(theme.manifest.name)?.started;
        setIsToggled(!!isEnabled);
    }, [theme]);

    const handleToggle = () => {
        if (isToggled) {
            disable(theme.manifest.name);
        } else {
            enable(theme.manifest.name);
        }
        setIsToggled(!isToggled);
    };

    return (
        <div style={{ marginBottom: '10px' }}>
            <div className="card" onClick={handleToggle} style={{ cursor: 'pointer' }}>
                <div className="info">
                    <h3><strong>{theme.manifest.name}</strong></h3>
                    <p>{theme.manifest.authors.join(", ")}</p>
                    <p>{theme.manifest.version}</p>
                </div>
                <p>{theme.manifest.description}</p>
            </div>
        </div>
    );
};
