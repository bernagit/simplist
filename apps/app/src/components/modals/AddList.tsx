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
  Box
} from '@mantine/core'
import { ContextModalProps } from '@mantine/modals'
import { useCallback, useState } from 'react'

const maxTitleLength = 200
const maxDescriptionLength = 500
const defaultColor = 'gray'

const colorSwatchesWithNames = [
  { name: 'Dark Gray', color: '#2e2e2e' },
  { name: 'Gray', color: '#868e96' },
  { name: 'Red', color: '#fa5252' },
  { name: 'Pink', color: '#e64980' },
  { name: 'Purple', color: '#be4bdb' },
  { name: 'Violet', color: '#7950f2' },
  { name: 'Indigo', color: '#4c6ef5' },
  { name: 'Blue', color: '#228be6' },
  { name: 'Cyan', color: '#15aabf' },
  { name: 'Teal', color: '#12b886' },
  { name: 'Green', color: '#40c057' },
  { name: 'Lime', color: '#82c91e' },
  { name: 'Yellow', color: '#fab005' },
  { name: 'Orange', color: '#fd7e14' }
]

export default function AddList({
  context,
  id,
  innerProps
}: ContextModalProps<{ listId?: string; data?: CreateListInput }>) {
  const listId = innerProps?.listId
  const isUpdateMode = !!listId
  const [title, setTitle] = useState(innerProps?.data?.title || '')
  const [description, setDescription] = useState(innerProps?.data?.description || '')
  const [color, setColor] = useState(innerProps?.data?.color || defaultColor)
  const createList = useCreateList()
  const updateList = useUpdateList()

  const [colorPickerOpened, setColorPickerOpened] = useState(false)

  const buttonLabel = isUpdateMode ? 'Update List' : 'Create List'

  const handleSaveList = useCallback(() => {
    if (isUpdateMode && listId) {
      updateList.mutate({ id: listId, title, description, color })
    } else {
      createList.mutate({ title, description, color })
    }
    context.closeModal(id)
  }, [isUpdateMode, listId, context, id, updateList, title, description, color, createList])

  return (
    <Stack
      style={{
        zIndex: 1000
      }}
    >
      <TextInput
        label="List Title"
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
        label="List Description"
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
          Color
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
      <Group justify="flex-end">
        <Button
          variant="outline"
          color="gray"
          onClick={() => {
            context.closeModal(id)
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleSaveList}>{buttonLabel}</Button>
      </Group>
    </Stack>
  )
}
