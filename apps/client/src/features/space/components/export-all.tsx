import React from 'react';
import { useSpaceQuery } from '@/features/space/queries/space-query.ts';
import { EditSpaceForm } from '@/features/space/components/edit-space-form.tsx';
import { Divider, Group, Text } from '@mantine/core';
import DeleteSpaceModal from './delete-space-modal';
import ExportAllModal from '@/features/space/components/export-all-modal.tsx';
import ImportAllModal from './import-all-modal';

interface ExportAllProps {
  spaceId: string;
  readOnly?: boolean;
}
export default function ExportAll({ spaceId, readOnly }: ExportAllProps) {
  const { data: space, isLoading } = useSpaceQuery(spaceId);

  return (
    <>
      {space && (
        <div>
          {/* <Text my="md" fw={600}>
            Details ALLLL
          </Text>
          <Divider my="lg" /> */}

          <br />

          {!readOnly && (
            <>

              <Group justify="space-between" wrap="nowrap" gap="xl">
                <div>
                  <Text size="md">Import Space Pages</Text>
                  <Text size="sm" c="dimmed">
                    Import all Pages from a Spave.
                  </Text>
                </div>

                <ImportAllModal space={space} />
              </Group>

              <br />

              <Group justify="space-between" wrap="nowrap" gap="xl">
                <div>
                  <Text size="md">Export All</Text>
                  <Text size="sm" c="dimmed">
                    Export All Pages from this Space.
                  </Text>
                </div>

                <ExportAllModal space={space} />
              </Group>
            </>
          )}
        </div>
      )}
    </>
  );
}
