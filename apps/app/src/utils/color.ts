import { MantineTheme } from "@mantine/core";

export function hexToRgba(hex: string, alpha: number) {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function nameToColor(theme: MantineTheme, name: string) {
    const map = {
        links: theme.colors.green[6],
        collections: theme.colors.gray[6],
        tags: theme.colors.red[6],
        favorites: theme.colors.yellow[6],
    };
    return map[name as keyof typeof map] || "teal";
}
