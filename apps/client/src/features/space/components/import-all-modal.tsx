import { Button, Divider, Group, Modal, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useDeleteSpaceMutation } from '../queries/space-query';
import { useField } from '@mantine/form';
import { useState } from "react";
import { ISpace } from '../types/space.types';
import { useNavigate } from 'react-router-dom';
import APP_ROUTE from '@/lib/app-route';
import { exportAllPageOfASpace } from '@/features/page/services/page-service';
import { ExportFormatSelection } from '@/features/page/components/page-export-modal';
import { ExportFormat } from "@/features/page/types/page.types.ts";

interface ImportAllModalProps {
  space: ISpace;
}

export default function ImportAllModal({ space }: ImportAllModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const exportSpaceMutation = useDeleteSpaceMutation();
  const navigate = useNavigate();
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.Markdown);
  const handleChange = (format: ExportFormat) => {
    setFormat(format);
  };


  const confirmNameField = useField({
    initialValue: '',
    validateOnChange: true,
    validate: (value) =>
      value.trim().toLowerCase() === space.name.trim().toLocaleLowerCase()
        ? null
        : 'Names do not match',
  });

  const handleImportAll = async () => {
    exportAllPageOfASpace(space.id, format)
    return;

    if (
      confirmNameField.getValue().trim().toLowerCase() !==
      space.name.trim().toLowerCase()
    ) {
      confirmNameField.validate();
      return;
    }

    try {
      // pass slug too so we can clear the local cache
      await exportSpaceMutation.mutateAsync({ id: space.id, slug: space.slug });
      navigate(APP_ROUTE.HOME);
    } catch (error) {
      console.error('Failed to delete space', error);
    }
  };

  return (
    <>
      <Button onClick={open} variant="light" color="Yellow">
        Import Space
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title="Are you sure you want to Import all Pages to this space?"
      >
        <Divider size="xs" mb="xs" />

        <Group justify="space-between" wrap="nowrap">
            <div>
              <Text size="md">Format</Text>
            </div>
            <ExportFormatSelection format={format} onChange={handleChange} />
        </Group>

        <Text mt="sm">
          Type the space name{' '}
          <Text span fw={500}>
            '{space.name}'
          </Text>{' '}
          to confirm your action.
        </Text>
        <TextInput
          {...confirmNameField.getInputProps()}
          variant="filled"
          placeholder="Confirm space name"
          py="sm"
          data-autofocus
        />
        <Group justify="flex-end" mt="md">
          <Button onClick={close} variant="default">
            Cancel
          </Button>
          <Button onClick={handleImportAll} color="red">
            Confirm
          </Button>
        </Group>
      </Modal>
    </>
  );
}