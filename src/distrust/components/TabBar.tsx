﻿import { React } from "../modules/discordModules";
import { Divider } from "./Components";

export const TabBar = ({ tabs }) => {
    const [activeTab, setActiveTab] = React.useState(tabs[0].id);
    const [hoveredTab, setHoveredTab] = React.useState(null);

    const handleTabClick = (tabId: any) => {
        setActiveTab(tabId);
    };

    const handleMouseEnter = (tabId: any) => {
        setHoveredTab(tabId);
    };

    const handleMouseLeave = () => {
        setHoveredTab(null);
    };

    return (
        <div>
            <div className="channelTabBar" style={{ textAlign: "center" }}>
                {tabs.map(
                    (tab: {
                        id: React.Key;
                        label:
                            | string
                            | number
                            | boolean
                            | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                            | Iterable<React.ReactNode>
                            | React.ReactPortal;
                    }) => (
                        <div key={tab.id} style={{ display: "inline-block" }}>
                            <button
                                className={`channelTabBarItem${activeTab === tab.id ? " selected" : ""}`}
                                onClick={() => handleTabClick(tab.id)}
                                onMouseEnter={() => handleMouseEnter(tab.id)}
                                onMouseLeave={handleMouseLeave}
                                style={{ position: "relative" }}>
                                {tab.label}
                                {activeTab === tab.id && <div className="highlight"></div>}
                                {(hoveredTab === tab.id || activeTab === tab.id) && (
                                    <div
                                        className="hoverIndicator"
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            width: "100%",
                                            height: 2,
                                            borderRadius: 3,
                                            backgroundColor:
                                                activeTab === tab.id
                                                    ? "var(--control-brand-foreground)"
                                                    : "var(--brand-experiment)",
                                        }}
                                    />
                                )}
                            </button>
                        </div>
                    ),
                )}
                <Divider />
            </div>
            <div>{tabs.map((tab) => activeTab === tab.id && tab.element())}</div>
        </div>
    );
};
