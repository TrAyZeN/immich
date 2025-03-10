import {
  AudioCodec,
  CQMode,
  CitiesFile,
  Colorspace,
  SystemConfig,
  SystemConfigEntity,
  SystemConfigKey,
  ToneMapping,
  TranscodeHWAccel,
  TranscodePolicy,
  VideoCodec,
} from '@app/infra/entities';
import { BadRequestException } from '@nestjs/common';
import { newCommunicationRepositoryMock, newJobRepositoryMock, newSystemConfigRepositoryMock } from '@test';
import { JobName, QueueName } from '../job';
import { ICommunicationRepository, IJobRepository, ISystemConfigRepository } from '../repositories';
import { SystemConfigValidator, defaults } from './system-config.core';
import { SystemConfigService } from './system-config.service';

const updates: SystemConfigEntity[] = [
  { key: SystemConfigKey.FFMPEG_CRF, value: 30 },
  { key: SystemConfigKey.OAUTH_AUTO_LAUNCH, value: true },
  { key: SystemConfigKey.TRASH_DAYS, value: 10 },
];

const updatedConfig = Object.freeze<SystemConfig>({
  job: {
    [QueueName.BACKGROUND_TASK]: { concurrency: 5 },
    [QueueName.CLIP_ENCODING]: { concurrency: 2 },
    [QueueName.METADATA_EXTRACTION]: { concurrency: 5 },
    [QueueName.OBJECT_TAGGING]: { concurrency: 2 },
    [QueueName.RECOGNIZE_FACES]: { concurrency: 2 },
    [QueueName.SEARCH]: { concurrency: 5 },
    [QueueName.SIDECAR]: { concurrency: 5 },
    [QueueName.LIBRARY]: { concurrency: 1 },
    [QueueName.STORAGE_TEMPLATE_MIGRATION]: { concurrency: 5 },
    [QueueName.MIGRATION]: { concurrency: 5 },
    [QueueName.THUMBNAIL_GENERATION]: { concurrency: 5 },
    [QueueName.VIDEO_CONVERSION]: { concurrency: 1 },
  },
  ffmpeg: {
    crf: 30,
    threads: 0,
    preset: 'ultrafast',
    targetAudioCodec: AudioCodec.AAC,
    targetResolution: '720',
    targetVideoCodec: VideoCodec.H264,
    maxBitrate: '0',
    bframes: -1,
    refs: 0,
    gopSize: 0,
    npl: 0,
    temporalAQ: false,
    cqMode: CQMode.AUTO,
    twoPass: false,
    transcode: TranscodePolicy.REQUIRED,
    accel: TranscodeHWAccel.DISABLED,
    tonemap: ToneMapping.HABLE,
  },
  machineLearning: {
    enabled: true,
    url: 'http://immich-machine-learning:3003',
    classification: {
      enabled: true,
      modelName: 'microsoft/resnet-50',
      minScore: 0.9,
    },
    clip: {
      enabled: true,
      modelName: 'ViT-B-32::openai',
    },
    facialRecognition: {
      enabled: true,
      modelName: 'buffalo_l',
      minScore: 0.7,
      maxDistance: 0.6,
      minFaces: 1,
    },
  },
  map: {
    enabled: true,
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  reverseGeocoding: {
    enabled: true,
    citiesFileOverride: CitiesFile.CITIES_500,
  },
  oauth: {
    autoLaunch: true,
    autoRegister: true,
    buttonText: 'Login with OAuth',
    clientId: '',
    clientSecret: '',
    enabled: false,
    issuerUrl: '',
    mobileOverrideEnabled: false,
    mobileRedirectUri: '',
    scope: 'openid email profile',
    storageLabelClaim: 'preferred_username',
  },
  passwordLogin: {
    enabled: true,
  },
  storageTemplate: {
    template: '{{y}}/{{y}}-{{MM}}-{{dd}}/{{filename}}',
  },
  thumbnail: {
    webpSize: 250,
    jpegSize: 1440,
    quality: 80,
    colorspace: Colorspace.P3,
  },
  trash: {
    enabled: true,
    days: 10,
  },
});

describe(SystemConfigService.name, () => {
  let sut: SystemConfigService;
  let configMock: jest.Mocked<ISystemConfigRepository>;
  let communicationMock: jest.Mocked<ICommunicationRepository>;
  let jobMock: jest.Mocked<IJobRepository>;

  beforeEach(async () => {
    delete process.env.IMMICH_CONFIG_FILE;
    configMock = newSystemConfigRepositoryMock();
    communicationMock = newCommunicationRepositoryMock();
    jobMock = newJobRepositoryMock();
    sut = new SystemConfigService(configMock, communicationMock, jobMock);
  });

  it('should work', () => {
    expect(sut).toBeDefined();
  });

  describe('getDefaults', () => {
    it('should return the default config', () => {
      configMock.load.mockResolvedValue(updates);

      expect(sut.getDefaults()).toEqual(defaults);
      expect(configMock.load).not.toHaveBeenCalled();
    });
  });

  describe('addValidator', () => {
    it('should call the validator on config changes', async () => {
      const validator: SystemConfigValidator = jest.fn();
      sut.addValidator(validator);
      await sut.updateConfig(defaults);
      expect(validator).toHaveBeenCalledWith(defaults);
    });
  });

  describe('getConfig', () => {
    it('should return the default config', async () => {
      configMock.load.mockResolvedValue([]);

      await expect(sut.getConfig()).resolves.toEqual(defaults);
    });

    it('should merge the overrides', async () => {
      configMock.load.mockResolvedValue([
        { key: SystemConfigKey.FFMPEG_CRF, value: 30 },
        { key: SystemConfigKey.OAUTH_AUTO_LAUNCH, value: true },
        { key: SystemConfigKey.TRASH_DAYS, value: 10 },
      ]);

      await expect(sut.getConfig()).resolves.toEqual(updatedConfig);
    });

    it('should load the config from a file', async () => {
      process.env.IMMICH_CONFIG_FILE = 'immich-config.json';
      const partialConfig = { ffmpeg: { crf: 30 }, oauth: { autoLaunch: true }, trash: { days: 10 } };
      configMock.readFile.mockResolvedValue(Buffer.from(JSON.stringify(partialConfig)));

      await expect(sut.getConfig()).resolves.toEqual(updatedConfig);

      expect(configMock.readFile).toHaveBeenCalledWith('immich-config.json');
    });

    it('should accept an empty configuration file', async () => {
      process.env.IMMICH_CONFIG_FILE = 'immich-config.json';
      configMock.readFile.mockResolvedValue(Buffer.from(JSON.stringify({})));

      await expect(sut.getConfig()).resolves.toEqual(defaults);

      expect(configMock.readFile).toHaveBeenCalledWith('immich-config.json');
    });

    const tests = [
      { should: 'validate numbers', config: { ffmpeg: { crf: 'not-a-number' } } },
      { should: 'validate booleans', config: { oauth: { enabled: 'invalid' } } },
      { should: 'validate enums', config: { ffmpeg: { transcode: 'unknown' } } },
      { should: 'validate top level unknown options', config: { unknownOption: true } },
      { should: 'validate nested unknown options', config: { ffmpeg: { unknownOption: true } } },
      { should: 'validate required oauth fields', config: { oauth: { enabled: true } } },
    ];

    for (const test of tests) {
      it(`should ${test.should}`, async () => {
        process.env.IMMICH_CONFIG_FILE = 'immich-config.json';
        configMock.readFile.mockResolvedValue(Buffer.from(JSON.stringify(test.config)));

        await expect(sut.getConfig()).rejects.toBeInstanceOf(Error);
      });
    }
  });

  describe('getStorageTemplateOptions', () => {
    it('should send back the datetime variables', () => {
      expect(sut.getStorageTemplateOptions()).toEqual({
        dayOptions: ['d', 'dd'],
        hourOptions: ['h', 'hh', 'H', 'HH'],
        minuteOptions: ['m', 'mm'],
        monthOptions: ['M', 'MM', 'MMM', 'MMMM'],
        presetOptions: [
          '{{y}}/{{y}}-{{MM}}-{{dd}}/{{filename}}',
          '{{y}}/{{MM}}-{{dd}}/{{filename}}',
          '{{y}}/{{MMMM}}-{{dd}}/{{filename}}',
          '{{y}}/{{MM}}/{{filename}}',
          '{{y}}/{{MMM}}/{{filename}}',
          '{{y}}/{{MMMM}}/{{filename}}',
          '{{y}}/{{MM}}/{{dd}}/{{filename}}',
          '{{y}}/{{MMMM}}/{{dd}}/{{filename}}',
          '{{y}}/{{y}}-{{MM}}/{{y}}-{{MM}}-{{dd}}/{{filename}}',
          '{{y}}-{{MM}}-{{dd}}/{{filename}}',
          '{{y}}-{{MMM}}-{{dd}}/{{filename}}',
          '{{y}}-{{MMMM}}-{{dd}}/{{filename}}',
          '{{y}}/{{y}}-{{MM}}/{{filename}}',
          '{{y}}/{{y}}-{{WW}}/{{filename}}',
        ],
        secondOptions: ['s', 'ss'],
        weekOptions: ['W', 'WW'],
        yearOptions: ['y', 'yy'],
      });
    });
  });

  describe('updateConfig', () => {
    it('should notify the microservices process', async () => {
      configMock.load.mockResolvedValue(updates);

      await expect(sut.updateConfig(updatedConfig)).resolves.toEqual(updatedConfig);

      expect(configMock.saveAll).toHaveBeenCalledWith(updates);
      expect(jobMock.queue).toHaveBeenCalledWith({ name: JobName.SYSTEM_CONFIG_CHANGE });
    });

    it('should throw an error if the config is not valid', async () => {
      const validator = jest.fn().mockRejectedValue('invalid config');

      sut.addValidator(validator);

      await expect(sut.updateConfig(updatedConfig)).rejects.toBeInstanceOf(BadRequestException);

      expect(validator).toHaveBeenCalledWith(updatedConfig);
      expect(configMock.saveAll).not.toHaveBeenCalled();
    });

    it('should throw an error if a config file is in use', async () => {
      process.env.IMMICH_CONFIG_FILE = 'immich-config.json';
      configMock.readFile.mockResolvedValue(Buffer.from(JSON.stringify({})));
      await expect(sut.updateConfig(defaults)).rejects.toBeInstanceOf(BadRequestException);
      expect(configMock.saveAll).not.toHaveBeenCalled();
    });
  });

  describe('refreshConfig', () => {
    it('should notify the subscribers', async () => {
      const changeMock = jest.fn();
      const subscription = sut.config$.subscribe(changeMock);

      await sut.refreshConfig();

      expect(changeMock).toHaveBeenCalledWith(defaults);

      subscription.unsubscribe();
    });
  });
});
