import { coreLogger } from "../../../devConsts";
import { getKeys } from "../../../api/webpack/getters";
import { modules } from "../../../api/webpack/common";

export const manifest =
    {
        name: 'contextMenu',
        version: '1.0.0',
        description: 'Allows people to add items to the ContextMenu component.',
        authors: ['kaan'],
        coreMod: true
    }

export interface ContextMenuData {
    navId: string;
    uwufied?: boolean;
    data: any[];
    children: React.ReactNode | React.ReactNode[];
}

interface ContextMenuProps {
    MenuGroup: React.FC<{ id?: string; children?: React.ReactNode }>;
    ContextMenu: React.FC<ContextMenuData & { plugged?: boolean }>;
}

interface MenuItem {
    sectionId?: number;
    indexInSection?: number;
    getItem: (data: any, menu: ContextMenuData) => React.ReactElement | null;
}

const ContextComponents: ContextMenuProps = {
    MenuGroup: (props) => <div {...props} />,
    ContextMenu: (props) => <div {...props} />,
};

export const menuItems: { [key: string]: MenuItem[] } = {};

export const makeItem = (navId: string, label: string, action: any, icon?: any): React.ReactElement | null => (
    <modules.components.MenuItem id={navId} label={label} action={action} icon={icon} />
);

export const buildItem = (navId: string, callback: (data: any, menu: ContextMenuData) => React.ReactElement | null) => {
    if (!menuItems[navId]) menuItems[navId] = [];
    const item = { getItem: (data: any, menu: ContextMenuData) => callback(data, menu) };
    menuItems[navId].push(item);
    return () => removeContextMenuItem(navId, item);
};

export const removeContextMenuItem = (navId: string | number, itemToRemove: MenuItem): void => {
    if (menuItems[navId]) menuItems[navId] = menuItems[navId].filter((item) => item !== itemToRemove);
};

export const finallyIBuildContextMenu = (menu: ContextMenuData): React.ReactElement | null => {
    const { navId } = menu;
    const { MenuGroup, ContextMenu } = ContextComponents;

    if (!ContextMenu || menu.uwufied) return null;
    if (!MenuGroup) return <modules.components.Menu {...menu} uwufied={true} />;

    const children = Array.isArray(menu.children) ? [...menu.children] : [menu.children];

    const items = menuItems[navId];
    if (items && items.length > 0) {
        const existingItems = children.filter((child) => child && (child as any)?.props && (child as any)?.props.id);
        const existingItemIds = existingItems.map((item) => (item as any)?.props.id);

        items.forEach((item) => {
            const itemElement = item.getItem(menu.data[0], menu);
            if (itemElement && !existingItemIds.includes((itemElement as any)?.props.id)) {
                children.push(itemElement);
            }
        });
    }

    menu.children = children;

    return <modules.components.Menu {...menu} uwufied={true} />;
};
export const start = () => {
    coreLogger.info('ContextMenu is in testing!');
};