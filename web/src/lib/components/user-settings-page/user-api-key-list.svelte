<script lang="ts">
  import { api, APIKeyResponseDto } from '@api';
  import PencilOutline from 'svelte-material-icons/PencilOutline.svelte';
  import TrashCanOutline from 'svelte-material-icons/TrashCanOutline.svelte';
  import { fade } from 'svelte/transition';
  import { handleError } from '../../utils/handle-error';
  import APIKeyForm from '../forms/api-key-form.svelte';
  import APIKeySecret from '../forms/api-key-secret.svelte';
  import ConfirmDialogue from '../shared-components/confirm-dialogue.svelte';
  import { notificationController, NotificationType } from '../shared-components/notification/notification';
  import { locale } from '$lib/stores/preferences.store';
  import Button from '../elements/buttons/button.svelte';

  export let keys: APIKeyResponseDto[];

  let newKey: Partial<APIKeyResponseDto> | null = null;
  let editKey: APIKeyResponseDto | null = null;
  let deleteKey: APIKeyResponseDto | null = null;
  let secret = '';

  const format: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  async function refreshKeys() {
    const { data } = await api.keyApi.getKeys();
    keys = data;
  }

  const handleCreate = async (event: CustomEvent<APIKeyResponseDto>) => {
    try {
      const dto = event.detail;
      const { data } = await api.keyApi.createKey({ aPIKeyCreateDto: dto });
      secret = data.secret;
    } catch (error) {
      handleError(error, 'Unable to create a new API Key');
    } finally {
      await refreshKeys();
      newKey = null;
    }
  };

  const handleUpdate = async (event: CustomEvent<APIKeyResponseDto>) => {
    if (!editKey) {
      return;
    }

    const dto = event.detail;

    try {
      await api.keyApi.updateKey({ id: editKey.id, aPIKeyUpdateDto: { name: dto.name } });
      notificationController.show({
        message: `Saved API Key`,
        type: NotificationType.Info,
      });
    } catch (error) {
      handleError(error, 'Unable to save API Key');
    } finally {
      await refreshKeys();
      editKey = null;
    }
  };

  const handleDelete = async () => {
    if (!deleteKey) {
      return;
    }

    try {
      await api.keyApi.deleteKey({ id: deleteKey.id });
      notificationController.show({
        message: `Removed API Key: ${deleteKey.name}`,
        type: NotificationType.Info,
      });
    } catch (error) {
      handleError(error, 'Unable to remove API Key');
    } finally {
      await refreshKeys();
      deleteKey = null;
    }
  };
</script>

{#if newKey}
  <APIKeyForm
    title="New API Key"
    submitText="Create"
    apiKey={newKey}
    on:submit={handleCreate}
    on:cancel={() => (newKey = null)}
  />
{/if}

{#if secret}
  <APIKeySecret {secret} on:done={() => (secret = '')} />
{/if}

{#if editKey}
  <APIKeyForm submitText="Save" apiKey={editKey} on:submit={handleUpdate} on:cancel={() => (editKey = null)} />
{/if}

{#if deleteKey}
  <ConfirmDialogue
    prompt="Are you sure you want to delete this API Key?"
    on:confirm={() => handleDelete()}
    on:cancel={() => (deleteKey = null)}
  />
{/if}

<section class="my-4">
  <div class="flex flex-col gap-2" in:fade={{ duration: 500 }}>
    <div class="mb-2 flex justify-end">
      <Button size="sm" on:click={() => (newKey = { name: 'API Key' })}>New API Key</Button>
    </div>

    {#if keys.length > 0}
      <table class="w-full text-left">
        <thead
          class="mb-4 flex h-12 w-full rounded-md border bg-gray-50 text-immich-primary dark:border-immich-dark-gray dark:bg-immich-dark-gray dark:text-immich-dark-primary"
        >
          <tr class="flex w-full place-items-center">
            <th class="w-1/3 text-center text-sm font-medium">Name</th>
            <th class="w-1/3 text-center text-sm font-medium">Created</th>
            <th class="w-1/3 text-center text-sm font-medium">Action</th>
          </tr>
        </thead>
        <tbody class="block w-full overflow-y-auto rounded-md border dark:border-immich-dark-gray">
          {#each keys as key, i}
            {#key key.id}
              <tr
                class={`flex h-[80px] w-full place-items-center text-center dark:text-immich-dark-fg ${
                  i % 2 == 0 ? 'bg-immich-gray dark:bg-immich-dark-gray/75' : 'bg-immich-bg dark:bg-immich-dark-gray/50'
                }`}
              >
                <td class="w-1/3 text-ellipsis px-4 text-sm">{key.name}</td>
                <td class="w-1/3 text-ellipsis px-4 text-sm"
                  >{new Date(key.createdAt).toLocaleDateString($locale, format)}
                </td>
                <td class="w-1/3 text-ellipsis px-4 text-sm">
                  <button
                    on:click={() => (editKey = key)}
                    class="rounded-full bg-immich-primary p-3 text-gray-100 transition-all duration-150 hover:bg-immich-primary/75 dark:bg-immich-dark-primary dark:text-gray-700"
                  >
                    <PencilOutline size="16" />
                  </button>
                  <button
                    on:click={() => (deleteKey = key)}
                    class="rounded-full bg-immich-primary p-3 text-gray-100 transition-all duration-150 hover:bg-immich-primary/75 dark:bg-immich-dark-primary dark:text-gray-700"
                  >
                    <TrashCanOutline size="16" />
                  </button>
                </td>
              </tr>
            {/key}
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</section>
