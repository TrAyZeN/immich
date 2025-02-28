<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { AppRoute } from '$lib/constants';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { handleError } from '$lib/utils/handle-error';
  import { AllJobStatusResponseDto, api, JobCommand, JobCommandDto, JobName } from '@api';
  import type { ComponentType } from 'svelte';
  import type Icon from 'svelte-material-icons/DotsVertical.svelte';
  import FaceRecognition from 'svelte-material-icons/FaceRecognition.svelte';
  import FileJpgBox from 'svelte-material-icons/FileJpgBox.svelte';
  import FileXmlBox from 'svelte-material-icons/FileXmlBox.svelte';
  import LibraryShelves from 'svelte-material-icons/LibraryShelves.svelte';
  import FolderMove from 'svelte-material-icons/FolderMove.svelte';
  import CogIcon from 'svelte-material-icons/Cog.svelte';
  import Table from 'svelte-material-icons/Table.svelte';
  import TagMultiple from 'svelte-material-icons/TagMultiple.svelte';
  import VectorCircle from 'svelte-material-icons/VectorCircle.svelte';
  import Video from 'svelte-material-icons/Video.svelte';
  import ConfirmDialogue from '../../shared-components/confirm-dialogue.svelte';
  import JobTile from './job-tile.svelte';
  import StorageMigrationDescription from './storage-migration-description.svelte';
  import Button from '../../elements/buttons/button.svelte';

  export let jobs: AllJobStatusResponseDto;

  interface JobDetails {
    title: string;
    subtitle?: string;
    allText?: string;
    missingText?: string;
    disabled?: boolean;
    icon: typeof Icon;
    allowForceCommand?: boolean;
    component?: ComponentType;
    handleCommand?: (jobId: JobName, jobCommand: JobCommandDto) => Promise<void>;
  }

  let faceConfirm = false;

  const handleFaceCommand = async (jobId: JobName, dto: JobCommandDto) => {
    if (dto.force) {
      faceConfirm = true;
      return;
    }

    await handleCommand(jobId, dto);
  };

  const onFaceConfirm = () => {
    faceConfirm = false;
    handleCommand(JobName.RecognizeFaces, { command: JobCommand.Start, force: true });
  };

  $: jobDetails = <Partial<Record<JobName, JobDetails>>>{
    [JobName.ThumbnailGeneration]: {
      icon: FileJpgBox,
      title: api.getJobName(JobName.ThumbnailGeneration),
      subtitle: 'Regenerate JPEG and WebP thumbnails',
    },
    [JobName.MetadataExtraction]: {
      icon: Table,
      title: api.getJobName(JobName.MetadataExtraction),
      subtitle: 'Extract metadata information i.e. GPS, resolution...etc',
    },
    [JobName.Library]: {
      icon: LibraryShelves,
      title: api.getJobName(JobName.Library),
      subtitle: 'Perform library tasks',
      allText: 'ALL',
      missingText: 'REFRESH',
    },
    [JobName.Sidecar]: {
      title: api.getJobName(JobName.Sidecar),
      icon: FileXmlBox,
      subtitle: 'Discover or synchronize sidecar metadata from the filesystem',
      allText: 'SYNC',
      missingText: 'DISCOVER',
      disabled: !$featureFlags.sidecar,
    },
    [JobName.ObjectTagging]: {
      icon: TagMultiple,
      title: api.getJobName(JobName.ObjectTagging),
      subtitle: 'Run machine learning to tag objects\nNote that some assets may not have any objects detected',
      disabled: !$featureFlags.tagImage,
    },
    [JobName.ClipEncoding]: {
      icon: VectorCircle,
      title: api.getJobName(JobName.ClipEncoding),
      subtitle: 'Run machine learning to generate clip embeddings',
      disabled: !$featureFlags.clipEncode,
    },
    [JobName.RecognizeFaces]: {
      icon: FaceRecognition,
      title: api.getJobName(JobName.RecognizeFaces),
      subtitle: 'Run machine learning to recognize faces',
      handleCommand: handleFaceCommand,
      disabled: !$featureFlags.facialRecognition,
    },
    [JobName.VideoConversion]: {
      icon: Video,
      title: api.getJobName(JobName.VideoConversion),
      subtitle: 'Transcode videos not in the desired format',
    },
    [JobName.StorageTemplateMigration]: {
      icon: FolderMove,
      title: api.getJobName(JobName.StorageTemplateMigration),
      allowForceCommand: false,
      component: StorageMigrationDescription,
    },
    [JobName.Migration]: {
      icon: FolderMove,
      title: api.getJobName(JobName.Migration),
      subtitle: 'Migrate thumbnails for assets and faces to the latest folder structure',
      allowForceCommand: false,
    },
  };
  $: jobList = Object.entries(jobDetails) as [JobName, JobDetails][];

  async function handleCommand(jobId: JobName, jobCommand: JobCommandDto) {
    const title = jobDetails[jobId]?.title;

    try {
      const { data } = await api.jobApi.sendJobCommand({ id: jobId, jobCommandDto: jobCommand });
      jobs[jobId] = data;

      switch (jobCommand.command) {
        case JobCommand.Empty:
          notificationController.show({
            message: `Cleared jobs for: ${title}`,
            type: NotificationType.Info,
          });
          break;
      }
    } catch (error) {
      handleError(error, `Command '${jobCommand.command}' failed for job: ${title}`);
    }
  }
</script>

{#if faceConfirm}
  <ConfirmDialogue
    prompt="Are you sure you want to reprocess all faces? This will also clear named people."
    on:confirm={onFaceConfirm}
    on:cancel={() => (faceConfirm = false)}
  />
{/if}

<div class="flex flex-col gap-7">
  <div class="flex justify-end">
    <a href="{AppRoute.ADMIN_SETTINGS}?open=job-settings">
      <Button size="sm">
        <CogIcon size="18" />
        <span class="pl-2">Manage Concurrency</span>
      </Button>
    </a>
  </div>
  {#each jobList as [jobName, { title, subtitle, disabled, allText, missingText, allowForceCommand, icon, component, handleCommand: handleCommandOverride }]}
    {@const { jobCounts, queueStatus } = jobs[jobName]}
    <JobTile
      {icon}
      {title}
      {disabled}
      {subtitle}
      allText={allText || 'ALL'}
      missingText={missingText || 'MISSING'}
      {allowForceCommand}
      {jobCounts}
      {queueStatus}
      on:command={({ detail }) => (handleCommandOverride || handleCommand)(jobName, detail)}
    >
      {#if component}
        <svelte:component this={component} slot="description" />
      {/if}
    </JobTile>
  {/each}
</div>
