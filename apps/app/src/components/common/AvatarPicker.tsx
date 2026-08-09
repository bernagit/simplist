'use client'

import { useState } from 'react'
import {
  Avatar,
  Modal,
  SimpleGrid,
  FileButton,
  Button,
  Stack,
  Divider,
  UnstyledButton,
  Overlay,
  Loader
} from '@mantine/core'
import { IconRefresh, IconUpload } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

const styles = ['sprouts'] as const
type Style = typeof styles[number]

const COUNT = 16

type AvatarOption = {
  style: Style
  seed: string
}

function randomSeed() {
  return Math.random().toString(36).slice(2, 10)
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function randomStyle(): Style {
  return pickRandom(styles)
}

function randomBatch(count: number): AvatarOption[] {
  return Array.from({ length: count }, () => ({
    style: randomStyle(),
    seed: randomSeed()
  }))
}

function diceBear({ style, seed }: AvatarOption) {
  return `https://api.dicebear.com/10.x/${style}/svg?seed=${seed}&size=256`
}

async function urlToDataUri(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function AvatarPicker({
  opened,
  onClose,
  value,
  onChange
}: {
  opened: boolean
  onClose: () => void
  value?: string | null
  onChange: (value: string) => void
}) {
  const t = useTranslations('AvatarPicker')
  const [options, setOptions] = useState<AvatarOption[]>(() => randomBatch(COUNT))
  const [loadingSeed, setLoadingSeed] = useState<string | null>(null)

  const shuffle = () => setOptions(randomBatch(COUNT))

  const handleFile = (file: File | null) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, 256, 256)

        onChange(canvas.toDataURL('image/jpeg', 0.8))
        onClose()
      }

      img.src = reader.result as string
    }

    reader.readAsDataURL(file)
  }

  const handlePick = async (option: AvatarOption) => {
    try {
      setLoadingSeed(option.seed)
      const dataUri = await urlToDataUri(diceBear(option))
      onChange(dataUri)
      onClose()
    } finally {
      setLoadingSeed(null)
    }
  }

  return (
    <Modal
      zIndex={600}
      opened={opened}
      onClose={onClose}
      title={t('title')}
      centered
      radius="md"
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 3, sm: 4 }} spacing="sm">
          {options.map((option, i) => {
            const url = diceBear(option)
            const isSelected = value === url
            const isLoading = loadingSeed === option.seed

            return (
              <UnstyledButton
                key={`${option.style}-${option.seed}-${i}`}
                onClick={() => handlePick(option)}
                disabled={loadingSeed !== null}
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 4,
                  borderRadius: 'var(--mantine-radius-xl)',
                  border: isSelected
                    ? '2px solid var(--mantine-color-primary)'
                    : '2px solid transparent',
                  transition: 'transform 150ms ease, border-color 150ms ease',
                  cursor: 'pointer'
                }}
              >
                <Avatar src={url} size="xl" radius="xl" />

                {isLoading && (
                  <Overlay
                    color="#000"
                    backgroundOpacity={0.4}
                    radius="xl"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Loader size="sm" color="white" />
                  </Overlay>
                )}
              </UnstyledButton>
            )
          })}
        </SimpleGrid>

        <Button
          variant="light"
          size="xs"
          leftSection={<IconRefresh size={14} />}
          onClick={shuffle}
          disabled={loadingSeed !== null}
        >
          {t('showMore')}
        </Button>

        <Divider labelPosition="center" my="xs" />

        <FileButton accept="image/png,image/jpeg,image/webp" onChange={handleFile}>
          {props => (
            <Button
              {...props}
              variant="default"
              leftSection={<IconUpload size={16} />}
              disabled={loadingSeed !== null}
              fullWidth
            >
              {t('uploadImage')}
            </Button>
          )}
        </FileButton>
      </Stack>
    </Modal>
  )
}