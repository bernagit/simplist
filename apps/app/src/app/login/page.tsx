"use client";

import { authService } from "@/services/auth";
import {
    TextInput,
    PasswordInput,
    Button,
    Container,
    Text,
    Paper,
    Group,
    Stack,
    Anchor,
    Loader,
    Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function LoginPage() {
    const [type, toggle] = useToggle(["login", "register"]);
    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const router = useRouter();

    const form = useForm({
        initialValues: {
            name: "",
            identifier: "",
            password: "",
            confirmPassword: "",
        },

        validate: {
            identifier: (val) => (val.length < 5 ? "Invalid identifier" : null),
            password: (val) =>
                val.length <= 6 ? "Password should include at least 6 characters" : null,
        },
    });

    const handleSubmit = useCallback(async () => {
        setErrorMessage(null);
        setIsLoading(true);
        const login = type === "login";
        try {
            if (login) {
                await authService.login(form.values.identifier, form.values.password);
            } else {
                await authService.register(
                    form.values.name,
                    form.values.identifier,
                    form.values.password
                );
            }
            router.push(`/`);
        } catch (error) {
            console.log("Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [type, form.values, router]);

    if (isLoading) {
        return (
            <Container size="xs" py="xl" mt="40vh">
                <Center>
                    <Loader size="xl" variant="dots" />
                </Center>
            </Container>
        );
    }

    return (
        <Container size="xs" py="xl">
            <Paper radius="md" p="lg" withBorder>
                <Text size="lg" fw={500} mb={50}>
                    Welcome to Simplist
                </Text>

                <form onSubmit={form.onSubmit(() => handleSubmit())}>
                    <Stack>
                        {type === "register" && (
                            <TextInput
                                label="Name"
                                placeholder="Your name"
                                value={form.values.name}
                                onChange={(event) =>
                                    form.setFieldValue("name", event.currentTarget.value)
                                }
                                radius="md"
                            />
                        )}

                        <TextInput
                            required
                            label={type === "login" ? "Email or Username" : "Email"}
                            placeholder={type === "login" ? "Your email or username" : "Your email"}
                            value={form.values.identifier}
                            onChange={(event) =>
                                form.setFieldValue("identifier", event.currentTarget.value)
                            }
                            error={form.errors.identifier && "Invalid identifier"}
                            radius="md"
                        />

                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            value={form.values.password}
                            onChange={(event) =>
                                form.setFieldValue("password", event.currentTarget.value)
                            }
                            error={
                                form.errors.password &&
                                "Password should include at least 6 characters"
                            }
                            radius="md"
                        />

                        {type === "register" && (
                            <PasswordInput
                                required
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={form.values.confirmPassword}
                                onChange={(event) =>
                                    form.setFieldValue("confirmPassword", event.currentTarget.value)
                                }
                                error={form.errors.confirmPassword && "Passwords do not match"}
                                radius="md"
                            />
                        )}

                        {errorMessage && (
                            <Text c="red" size="sm">
                                {errorMessage}
                            </Text>
                        )}
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Anchor component="button" type="button" onClick={() => toggle()} size="xs">
                            {type === "register"
                                ? "Already have an account? Login"
                                : "Don't have an account? Register"}
                        </Anchor>
                        <Button type="submit" radius="xl">
                            {upperFirst(type)}
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}
