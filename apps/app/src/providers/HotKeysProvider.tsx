"use client";

import { useHotkeys } from "@mantine/hooks";
import { useParams, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { modals } from "@mantine/modals";
import { HOTKEYS } from "@/utils/hotkeys";

export function HotkeyProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const params = useParams();

    useHotkeys([
        [
            HOTKEYS.NEW_LINK.keys,
            () => {
                modals.openContextModal({
                    modal: "addLink",
                    title: "Add new link",
                    centered: true,
                    size: "lg",
                    innerProps: {
                        collectionId: params.id,
                    },
                });
            },
        ],
        [
            HOTKEYS.NEW_COLLECTION.keys,
            () => {
                modals.openContextModal({
                    modal: "addCollection",
                    title: "Add new collection",
                    centered: true,
                    size: "lg",
                    innerProps: {
                        parentId: params.id,
                    },
                });
            },
        ],
        [
            HOTKEYS.FAVORITE.keys,
            () => {
                console.log("Favorite toggled");
            },
        ],
        [
            HOTKEYS.NAV_DASHBOARD.keys,
            () => {
                console.log("Navigating to dashboard");
                router.push("/");
            },
        ],
        [
            HOTKEYS.NAV_COLLECTIONS.keys,
            () => {
                console.log("Navigating to collections");
                router.push("/collections");
            },
        ],
        [
            HOTKEYS.SHORTCUT_HELP.keys,
            () => {
                modals.openContextModal({
                    modal: "showHelp",
                    title: "Keyboard Shortcuts",
                    size: "lg",
                    centered: true,
                    innerProps: {},
                });
            },
        ],
    ]);

    return <>{children}</>;
}
