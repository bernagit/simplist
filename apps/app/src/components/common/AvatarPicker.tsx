'use client'

import { useState } from 'react'
import { Avatar, Modal, SimpleGrid, FileButton, Button, Stack } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'

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
  const [options, setOptions] = useState<AvatarOption[]>(() => randomBatch(COUNT))

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
    const dataUri = await urlToDataUri(diceBear(option))
    onChange(dataUri)
    onClose()
  }

  return (
    <Modal zIndex={600} opened={opened} onClose={onClose} title="Choose your avatar" centered>
      <Stack>
        <SimpleGrid cols={4}>
          {options.map((option, i) => {
            const url = diceBear(option)
            const isSelected = value === url

            return (
              <Avatar
                key={`${option.style}-${option.seed}-${i}`}
                src={url}
                size="xl"
                radius="xl"
                style={{
                  cursor: 'pointer',
                  outline: isSelected ? '2px solid var(--mantine-color-blue-6)' : 'none',
                  outlineOffset: 2
                }}
                onClick={() => handlePick(option)}
              />
            )
          })}
        </SimpleGrid>

        <Button variant="subtle" size="xs" leftSection={<IconRefresh size={14} />} onClick={shuffle}>
          Show more
        </Button>

        <FileButton accept="image/png,image/jpeg,image/webp" onChange={handleFile}>
          {props => <Button {...props}>Upload image</Button>}
        </FileButton>
      </Stack>
    </Modal>
  )
}