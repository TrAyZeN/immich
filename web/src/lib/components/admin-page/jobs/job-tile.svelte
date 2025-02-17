<script lang="ts">
  import type Icon from 'svelte-material-icons/AbTesting.svelte';
  import SelectionSearch from 'svelte-material-icons/SelectionSearch.svelte';
  import Play from 'svelte-material-icons/Play.svelte';
  import Pause from 'svelte-material-icons/Pause.svelte';
  import FastForward from 'svelte-material-icons/FastForward.svelte';
  import AllInclusive from 'svelte-material-icons/AllInclusive.svelte';
  import Close from 'svelte-material-icons/Close.svelte';
  import AlertCircle from 'svelte-material-icons/AlertCircle.svelte';
  import { locale } from '$lib/stores/preferences.store';
  import { createEventDispatcher } from 'svelte';
  import { JobCommand, JobCommandDto, JobCountsDto, QueueStatusDto } from '@api';
  import Badge from '$lib/components/elements/badge.svelte';
  import JobTileButton from './job-tile-button.svelte';
  import JobTileStatus from './job-tile-status.svelte';

  export let title: string;
  export let subtitle: string | undefined = undefined;
  export let jobCounts: JobCountsDto;
  export let queueStatus: QueueStatusDto;
  export let allowForceCommand = true;
  export let icon: typeof Icon;
  export let disabled = false;

  export let allText: string;
  export let missingText: string;

  const slots = $$props.$$slots;

  $: waitingCount = jobCounts.waiting + jobCounts.paused + jobCounts.delayed;
  $: isIdle = !queueStatus.isActive && !queueStatus.isPaused;

  const commonClasses = 'flex place-items-center justify-between w-full py-2 sm:py-4 pr-4 pl-6';

  const dispatch = createEventDispatcher<{ command: JobCommandDto }>();
</script>

<div
  class="flex flex-col overflow-hidden rounded-2xl bg-gray-100 dark:bg-immich-dark-gray sm:flex-row sm:rounded-[35px]"
>
  <div class="flex w-full flex-col">
    {#if queueStatus.isPaused}
      <JobTileStatus color="warning">Paused</JobTileStatus>
    {:else if queueStatus.isActive}
      <JobTileStatus color="success">Active</JobTileStatus>
    {/if}
    <div class="flex flex-col gap-2 p-5 sm:p-7 md:p-9">
      <div class="flex items-center gap-4 text-xl font-semibold text-immich-primary dark:text-immich-dark-primary">
        <span class="flex items-center gap-2">
          <svelte:component this={icon} size="1.25em" class="hidden shrink-0 sm:block" />
          {title.toUpperCase()}
        </span>
        <div class="flex gap-2">
          {#if jobCounts.failed > 0}
            <Badge color="primary">
              {jobCounts.failed.toLocaleString($locale)} failed
            </Badge>
          {/if}
          {#if jobCounts.delayed > 0}
            <Badge color="secondary">
              {jobCounts.delayed.toLocaleString($locale)} delayed
            </Badge>
          {/if}
        </div>
      </div>

      {#if subtitle}
        <div class="whitespace-pre-line text-sm dark:text-white">{subtitle}</div>
      {/if}

      {#if slots?.description}
        <div class="text-sm dark:text-white">
          <slot name="description" />
        </div>
      {/if}

      <div class="mt-2 flex w-full max-w-md flex-col sm:flex-row">
        <div
          class="{commonClasses} rounded-t-lg bg-immich-primary text-white dark:bg-immich-dark-primary dark:text-immich-dark-gray sm:rounded-l-lg sm:rounded-r-none"
        >
          <p>Active</p>
          <p class="text-2xl">
            {jobCounts.active.toLocaleString($locale)}
          </p>
        </div>

        <div
          class="{commonClasses} flex-row-reverse rounded-b-lg bg-gray-200 text-immich-dark-bg dark:bg-gray-700 dark:text-immich-gray sm:rounded-l-none sm:rounded-r-lg"
        >
          <p class="text-2xl">
            {waitingCount.toLocaleString($locale)}
          </p>
          <p>Waiting</p>
        </div>
      </div>
    </div>
  </div>
  <div class="flex w-full flex-row overflow-hidden sm:w-32 sm:flex-col">
    {#if disabled}
      <JobTileButton
        disabled={true}
        color="light-gray"
        on:click={() => dispatch('command', { command: JobCommand.Start, force: false })}
      >
        <AlertCircle size="36" /> DISABLED
      </JobTileButton>
    {:else if !isIdle}
      {#if waitingCount > 0}
        <JobTileButton color="gray" on:click={() => dispatch('command', { command: JobCommand.Empty, force: false })}>
          <Close size="24" /> CLEAR
        </JobTileButton>
      {/if}
      {#if queueStatus.isPaused}
        {@const size = waitingCount > 0 ? '24' : '48'}
        <JobTileButton
          color="light-gray"
          on:click={() => dispatch('command', { command: JobCommand.Resume, force: false })}
        >
          <!-- size property is not reactive, so have to use width and height -->
          <FastForward width={size} height={size} /> RESUME
        </JobTileButton>
      {:else}
        <JobTileButton
          color="light-gray"
          on:click={() => dispatch('command', { command: JobCommand.Pause, force: false })}
        >
          <Pause size="24" /> PAUSE
        </JobTileButton>
      {/if}
    {:else if allowForceCommand}
      <JobTileButton color="gray" on:click={() => dispatch('command', { command: JobCommand.Start, force: true })}>
        <AllInclusive size="24" />
        {allText}
      </JobTileButton>
      <JobTileButton
        color="light-gray"
        on:click={() => dispatch('command', { command: JobCommand.Start, force: false })}
      >
        <SelectionSearch size="24" />
        {missingText}
      </JobTileButton>
    {:else}
      <JobTileButton
        color="light-gray"
        on:click={() => dispatch('command', { command: JobCommand.Start, force: false })}
      >
        <Play size="48" /> START
      </JobTileButton>
    {/if}
  </div>
</div>
