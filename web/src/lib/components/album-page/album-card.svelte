<script lang="ts">
  import noThumbnailUrl from '$lib/assets/no-thumbnail.png';
  import { locale } from '$lib/stores/preferences.store';
  import { AlbumResponseDto, api, ThumbnailFormat, UserResponseDto } from '@api';
  import { createEventDispatcher, onMount } from 'svelte';
  import DotsVertical from 'svelte-material-icons/DotsVertical.svelte';
  import IconButton from '../elements/buttons/icon-button.svelte';
  import type { OnClick, OnShowContextMenu } from './album-card';
  import { getContextMenuPosition } from '../../utils/context-menu';

  export let album: AlbumResponseDto;
  export let isSharingView = false;
  export let user: UserResponseDto;
  export let showItemCount = true;
  export let showContextMenu = true;
  let showVerticalDots = false;

  $: imageData = album.albumThumbnailAssetId
    ? api.getAssetThumbnailUrl(album.albumThumbnailAssetId, ThumbnailFormat.Webp)
    : noThumbnailUrl;

  const dispatchClick = createEventDispatcher<OnClick>();
  const dispatchShowContextMenu = createEventDispatcher<OnShowContextMenu>();

  const loadHighQualityThumbnail = async (thubmnailId: string | null) => {
    if (thubmnailId == null) {
      return;
    }

    const { data } = await api.assetApi.getAssetThumbnail(
      {
        id: thubmnailId,
        format: ThumbnailFormat.Jpeg,
      },
      {
        responseType: 'blob',
      },
    );

    if (data instanceof Blob) {
      return URL.createObjectURL(data);
    }
  };

  const showAlbumContextMenu = (e: MouseEvent) =>
    dispatchShowContextMenu('showalbumcontextmenu', getContextMenuPosition(e));

  onMount(async () => {
    imageData = (await loadHighQualityThumbnail(album.albumThumbnailAssetId)) || noThumbnailUrl;
  });

  const getAlbumOwnerInfo = async (): Promise<UserResponseDto> => {
    const { data } = await api.userApi.getUserById({ id: album.ownerId });

    return data;
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="group relative mt-4 rounded-3xl border-[3px] border-transparent p-5 hover:cursor-pointer hover:border-immich-primary/75 dark:hover:border-immich-dark-primary/75"
  on:click={() => dispatchClick('click', album)}
  on:keydown={() => dispatchClick('click', album)}
  on:mouseenter={() => (showVerticalDots = true)}
  on:mouseleave={() => (showVerticalDots = false)}
  data-testid="album-card"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#if showContextMenu}
    <div
      id={`icon-${album.id}`}
      class="absolute right-6 top-6 z-10"
      on:click|stopPropagation|preventDefault={showAlbumContextMenu}
      class:hidden={!showVerticalDots}
      data-testid="context-button-parent"
    >
      <IconButton color="transparent-primary">
        <DotsVertical size="20" class="icon-white-drop-shadow" color="white" />
      </IconButton>
    </div>
  {/if}

  <div class={`relative aspect-square`}>
    <img
      src={imageData}
      alt={album.id}
      class={`z-0 h-full w-full rounded-3xl object-cover transition-all duration-300 hover:shadow-lg`}
      data-testid="album-image"
      draggable="false"
    />
    <div
      class="absolute top-0 h-full w-full rounded-3xl {isSharingView
        ? 'group-hover:bg-yellow-800/25'
        : 'group-hover:bg-indigo-800/25'} "
    />
  </div>

  <div class="mt-4">
    <p
      class="w-full truncate text-lg font-semibold text-immich-primary dark:text-immich-dark-primary"
      data-testid="album-name"
      title={album.albumName}
    >
      {album.albumName}
    </p>

    <span class="flex gap-2 text-sm dark:text-immich-dark-fg" data-testid="album-details">
      {#if showItemCount}
        <p>
          {album.assetCount.toLocaleString($locale)}
          {album.assetCount == 1 ? `item` : `items`}
        </p>
      {/if}

      {#if isSharingView || album.shared}
        <p>·</p>
      {/if}

      {#if isSharingView}
        {#await getAlbumOwnerInfo() then albumOwner}
          {#if user.email == albumOwner.email}
            <p>Owned</p>
          {:else}
            <p>
              Shared by {albumOwner.firstName}
              {albumOwner.lastName}
            </p>
          {/if}
        {/await}
      {:else if album.shared}
        <p>Shared</p>
      {/if}
    </span>
  </div>
</div>
