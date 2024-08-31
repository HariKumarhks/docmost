import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Image,
  Text,
  useComputedColorScheme,
} from '@mantine/core';
import { useState } from 'react';
import { Excalidraw, exportToSvg, loadFromBlob } from '@excalidraw/excalidraw';
import { uploadFile } from '@/features/page/services/page-service.ts';
import { svgStringToFile } from '@/lib';
import { useDisclosure } from '@mantine/hooks';
import { getFileUrl } from '@/lib/config.ts';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { IAttachment } from '@/lib/types';
import ReactClearModal from 'react-clear-modal';
import clsx from 'clsx';
import { IconEdit } from '@tabler/icons-react';

export default function ExcalidrawView(props: NodeViewProps) {
  const { node, updateAttributes, editor, selected } = props;
  const { src, title, width, attachmentId } = node.attrs;

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI>(null);
  const [excalidrawData, setExcalidrawData] = useState<any>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const computedColorScheme = useComputedColorScheme();

  const handleOpen = async () => {
    if (!editor.isEditable) {
      return;
    }

    try {
      let data = null;
      if (src) {
        const url = getFileUrl(src);
        const request = await fetch(url, { credentials: 'include' });

        data = await loadFromBlob(await request.blob(), null, null);
      }

      setExcalidrawData(data);
    } catch (err) {
      console.error(err);
    } finally {
      open();
    }
  };

  const handleSave = async () => {
    if (!excalidrawAPI) {
      return;
    }

    const svg = await exportToSvg({
      elements: excalidrawAPI?.getSceneElements(),
      appState: {
        exportEmbedScene: true,
        exportWithDarkMode: computedColorScheme == 'light' ? false : true,
      },
      files: excalidrawAPI?.getFiles(),
    });

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const fileName = 'diagram.excalidraw.svg';

    const excalidrawSvgFile = await svgStringToFile(svgString, fileName);

    const pageId = editor.storage?.pageId;

    let attachment: IAttachment = null;
    if (attachmentId) {
      attachment = await uploadFile(excalidrawSvgFile, pageId, attachmentId);
    } else {
      attachment = await uploadFile(excalidrawSvgFile, pageId);
    }

    updateAttributes({
      src: `/files/${attachment.id}/${attachment.fileName}?t=${new Date(attachment.updatedAt).getTime()}`,
      title: attachment.fileName,
      size: attachment.fileSize,
      attachmentId: attachment.id,
    });

    close();
  };

  return (
    <NodeViewWrapper>
      <ReactClearModal
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: 0,
          zIndex: 200,
        }}
        isOpen={opened}
        onRequestClose={close}
        disableCloseOnBgClick={true}
        contentProps={{
          style: {
            padding: 0,
            width: '90vw',
          },
        }}
      >
        <Group
          justify="flex-end"
          wrap="nowrap"
          bg="var(--mantine-color-body)"
          p="xs"
        >
          <Button onClick={handleSave} size={'compact-sm'}>
            Save & Exit
          </Button>
          <Button onClick={close} color="red" size={'compact-sm'}>
            Exit
          </Button>
        </Group>
        <div style={{ height: '90vh' }}>
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={{
              ...excalidrawData,
              scrollToContent: true,
            }}
          />
        </div>
      </ReactClearModal>

      {src ? (
        <div style={{ position: 'relative' }}>
          <Image
            onClick={(e) => e.detail === 2 && handleOpen()}
            radius="md"
            fit="contain"
            w={width}
            src={getFileUrl(src)}
            alt={title}
            className={clsx(
              selected ? 'ProseMirror-selectednode' : '',
              'alignCenter'
            )}
          />

          {selected && (
            <ActionIcon
              onClick={handleOpen}
              variant="default"
              color="gray"
              mx="xs"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <IconEdit size={18} />
            </ActionIcon>
          )}
        </div>
      ) : (
        <Card
          radius="md"
          onClick={(e) => e.detail === 2 && handleOpen()}
          p="xs"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          withBorder
          className={clsx(selected ? 'ProseMirror-selectednode' : '')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ActionIcon variant="transparent" color="gray">
              <IconEdit size={18} />
            </ActionIcon>

            <Text component="span" size="lg" c="dimmed">
              Double-click to edit excalidraw diagram
            </Text>
          </div>
        </Card>
      )}
    </NodeViewWrapper>
  );
}
