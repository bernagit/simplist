"use client";
import {
  Stack,
  Text,
  NavLink,
  ScrollArea,
  Box,
  Divider,
  Group,
  Avatar,
  Menu,
  ActionIcon,
  UnstyledButton
} from "@mantine/core";
import {
  IconHome2,
  IconCalendar,
  IconSearch,
  IconSettings,
  IconPlus,
  IconPoint,
  IconChevronDown,
  IconLogout,
  IconUserCircle,
  IconLayoutSidebar,
  IconChevronRight,
  IconHelp,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { spotlight } from "@mantine/spotlight";
import { useMe } from "@/queries/auth";
import { useLists } from "@/queries/lists";
import { useSidebar } from "@/providers/SidebarProvider";
import { useColorScheme } from "@mantine/hooks";
import { useTopbar } from "@/providers/TopbarProvider";

const SIDEBAR_WIDTH = 280;
const MY_PROJECTS_TEXT = "My Projects";

export function Sidebar() {
  const { toggle, opened, isMobile } = useSidebar();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const { setBreadcrumbs } = useTopbar();

  const { data: me, isLoading: meLoading } = useMe();
  const { data: lists } = useLists();

  const handleNavigate = (href: string, title?: string) => {
    setBreadcrumbs([
      {
        label: title ?? "",
        href: href
      }
    ]);

    router.push(href);

    if (isMobile) {
      toggle();
    }
  };

  if (!opened) return null;

  return (
    <Box
      w={SIDEBAR_WIDTH}
      h={isMobile ? "100dvh" : "100%"}
      pos={isMobile ? "fixed" : "relative"}
      style={{
        top: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
        zIndex: isMobile ? 300 : undefined,
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 200ms ease"
      }}
      bg={colorScheme === "dark" ? "var(--mantine-color-dark-7)" : "var(--mantine-color-gray-0)"}
    >
      <Stack gap={0} h="100%">
        <Menu shadow="md" width={SIDEBAR_WIDTH + 10} position="bottom-start">
          <Menu.Target>
            <Group gap="sm" wrap="nowrap" ml={0} m="xs">
              <UnstyledButton
                style={{
                  width: "100%",
                  borderRadius: "var(--mantine-radius-md)",
                }}
              >
                <Group gap="sm" wrap="nowrap" px="md" py="xs">
                  <Avatar radius="xl" color="blue">
                    {me?.initials}
                  </Avatar>

                  <Box>
                    <Text size="sm" fw={500} truncate>
                      {meLoading ? "Loading..." : me?.name}
                    </Text>

                    <Text size="xs" c="dimmed" truncate>
                      {me?.email}
                    </Text>
                  </Box>

                  <IconChevronDown size={14} />
                </Group>
              </UnstyledButton>
              {opened && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="md"
                  onClick={toggle}
                  aria-label="Toggle sidebar"
                  mr="xs"
                >
                  <IconLayoutSidebar size={18} />
                </ActionIcon>
              )}
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconUserCircle size={16} />} onClick={() => handleNavigate("/profile")}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => handleNavigate("/settings")}>
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconLogout size={16} />}>
              Log out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* Nav */}
        <ScrollArea flex={1} scrollbarSize={4} type="hover">
          <Stack gap={2} p="xs">
            <NavLink
              label="Home"
              leftSection={<IconHome2 size={18} />}
              active={pathname === "/"}
              onClick={() => handleNavigate("/")}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            />
            <NavLink
              label="Calendar"
              leftSection={<IconCalendar size={18} />}
              active={pathname === "/calendar"}
              onClick={() => handleNavigate("/calendar")}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            />
            <NavLink
              label="Search"
              leftSection={<IconSearch size={18} />}
              active={pathname === "/search"}
              onClick={() => spotlight.open()}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            />

            <Divider my="xs" />

            <NavLink
              label={
                <Group justify="space-between" align="center" style={{ width: "100%" }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.06em" }}>
                    {MY_PROJECTS_TEXT}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();

                    }}
                    aria-label="Add project"
                  >
                    <IconPlus size={14} />
                  </ActionIcon>
                </Group>
              }
              rightSection={
                <Group wrap="nowrap" gap={4} flex={1}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectsOpen((o) => !o);
                    }}
                    aria-label={projectsOpen ? "Collapse projects" : "Expand projects"}
                  >
                    <IconChevronRight size={14} />
                  </ActionIcon>
                </Group>
              }
              opened={projectsOpen}
              onChange={setProjectsOpen}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            >
              {lists?.data.owned.map((list) => (
                <NavLink
                  key={list.id}
                  label={list.title}
                  leftSection={
                    <IconPoint
                      size={18}
                      color={
                        list.color
                          ? `var(--mantine-color-${list.color}-6)`
                          : "var(--mantine-color-gray-6)"
                      }
                      fill={
                        list.color
                          ? `var(--mantine-color-${list.color}-6)`
                          : "var(--mantine-color-gray-6)"
                      }
                    />
                  }
                  active={pathname === `/lists/${list.id}`}
                  onClick={() => handleNavigate(`/lists/${list.id}`, MY_PROJECTS_TEXT)}
                  style={{ borderRadius: "var(--mantine-radius-md)" }}
                />
              ))}
              <NavLink
                label={<Text size="sm" c="dimmed">Add project</Text>}
                leftSection={<IconPlus size={16} />}
                style={{ borderRadius: "var(--mantine-radius-md)" }}
              />
            </NavLink>
          </Stack>
        </ScrollArea>

        {/* Bottom */}
        <Box p="xs">
          <Divider mb="xs" />
          <NavLink
            label="Help & Support"
            leftSection={<IconHelp size={18} />}
            style={{ borderRadius: "var(--mantine-radius-md)" }}
          />
        </Box>
      </Stack>
    </Box>
  );
}