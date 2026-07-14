'use client'

import { Center, Container, Loader } from '@mantine/core'

export function LoadingScreen() {
  return (
    <Container size="xs" py="xl">
      <Center h="100dvh">
        <Loader size="lg" />
      </Center>
    </Container>
  )
}
