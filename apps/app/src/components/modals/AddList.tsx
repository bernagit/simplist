'use client'

import { CreateListInput } from '@/models/lists'
import { useCreateList, useUpdateList } from '@/queries/lists'
import {
  Stack,
  Textarea,
  TextInput,
  Text,
  Group,
  Button,
  Popover,
  Input,
  ColorPicker,
  Box,
  Title,
  ActionIcon
} from '@mantine/core'
import { ContextModalProps } from '@mantine/modals'
import { IconX } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'

const maxTitleLength = 200
const maxDescriptionLength = 500
const defaultColor = '#868e96'

export default function AddList({
  context,
  id,
  innerProps
}: ContextModalProps<{ listId?: string; data?: CreateListInput }>) {
  const t = useTranslations('AddList')
  
  const colorSwatchesWithNames = useMemo(
    () => [
      { name: t('colors.darkGray'), color: '#2e2e2e' },
      { name: t('colors.gray'), color: '#868e96' },
      { name: t('colors.red'), color: '#fa5252' },
      { name: t('colors.pink'), color: '#e64980' },
      { name: t('colors.purple'), color: '#be4bdb' },
      { name: t('colors.violet'), color: '#7950f2' },
      { name: t('colors.indigo'), color: '#4c6ef5' },
      { name: t('colors.blue'), color: '#228be6' },
      { name: t('colors.cyan'), color: '#15aabf' },
      { name: t('colors.teal'), color: '#12b886' },
      { name: t('colors.green'), color: '#40c057' },
      { name: t('colors.lime'), color: '#82c91e' },
      { name: t('colors.yellow'), color: '#fab005' },
      { name: t('colors.orange'), color: '#fd7e14' }
    ],
    [t]
  )

  const listId = innerProps?.listId
  const isUpdateMode = !!listId
  const [title, setTitle] = useState(innerProps?.data?.title || '')
  const [description, setDescription] = useState(innerProps?.data?.description || '')
  const [color, setColor] = useState(innerProps?.data?.color || defaultColor)
  const createList = useCreateList()
  const updateList = useUpdateList()

  const isFormValid = useMemo(() => {
    return title.trim().length > 0 && title.trim().length <= maxTitleLength
  }, [title])

  const [colorPickerOpened, setColorPickerOpened] = useState(false)

  const modalTitle = isUpdateMode ? t('titleUpdate') : t('titleCreate')
  const buttonLabel = isUpdateMode ? t('actions.update') : t('actions.create')

  const handleSaveList = useCallback(() => {
    if (isUpdateMode && listId) {
      updateList.mutate({ id: listId, title, description, color })
    } else {
      createList.mutate({ title, description, color })
    }
    context.closeModal(id)
  }, [isUpdateMode, listId, context, id, updateList, title, description, color, createList])

  return (
    <Stack style={{ zIndex: 1000 }}>
      {/* Header del Modale */}
      <Group justify="space-between" align="center" pb="xs">
        <Title order={3}>{modalTitle}</Title>
        <ActionIcon variant="subtle" color="gray" onClick={() => context.closeModal(id)}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      {/* Form di inserimento/modifica */}
      <TextInput
        label={t('fields.title')}
        value={title}
        onChange={e => setTitle(e.currentTarget.value)}
        maxLength={maxTitleLength}
        rightSection={
          <Text size="sm" c="dimmed" mr={10}>
            {title.length}/{maxTitleLength}
          </Text>
        }
        styles={{
          input: {
            paddingRight: 70
          }
        }}
      />

      <Textarea
        label={t('fields.description')}
        value={description}
        onChange={e => setDescription(e.currentTarget.value)}
        maxLength={maxDescriptionLength}
        minRows={4}
        rightSection={
          <Text size="sm" c="dimmed">
            {description.length}/{maxDescriptionLength}
          </Text>
        }
        rightSectionWidth={70}
        styles={{
          input: {
            paddingRight: 70
          }
        }}
      />

      <Stack gap={0}>
        <Text size="sm" fw={600}>
          {t('fields.color')}
        </Text>
        <Popover
          opened={colorPickerOpened}
          onClose={() => setColorPickerOpened(false)}
          position="bottom-start"
          zIndex={1000}
          clickOutsideEvents={['mouseup', 'touchend']}
          closeOnClickOutside={true}
        >
          <Popover.Target>
            <Input.Wrapper>
              <Input
                component="button"
                type="button"
                pointer
                onClick={() => setColorPickerOpened(o => !o)}
                rightSection={<Box w={16} h={16} bg={color} style={{ borderRadius: 999 }} />}
              >
                {colorSwatchesWithNames.find(swatch => swatch.color === color)?.name || color}
              </Input>
            </Input.Wrapper>
          </Popover.Target>
          <Popover.Dropdown>
            <ColorPicker
              color={color || 'inherit'}
              onChange={c => {
                setColor(c)
                setColorPickerOpened(false)
              }}
              swatches={colorSwatchesWithNames.map(swatch => swatch.color)}
            />
          </Popover.Dropdown>
        </Popover>
      </Stack>

      <Group justify="flex-end" mt="md">
        <Button variant="outline" color="gray" onClick={() => context.closeModal(id)}>
          {t('actions.cancel')}
        </Button>
        <Button disabled={!isFormValid} onClick={handleSaveList}>
          {buttonLabel}
        </Button>
      </Group>
    </Stack>
  )
}