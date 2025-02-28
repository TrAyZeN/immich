//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.12

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class SharedLinkCreateDto {
  /// Returns a new [SharedLinkCreateDto] instance.
  SharedLinkCreateDto({
    this.albumId,
    this.allowDownload = true,
    this.allowUpload = false,
    this.assetIds = const [],
    this.description,
    this.expiresAt,
    this.showExif = true,
    required this.type,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? albumId;

  bool allowDownload;

  bool allowUpload;

  List<String> assetIds;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? description;

  DateTime? expiresAt;

  bool showExif;

  SharedLinkType type;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SharedLinkCreateDto &&
     other.albumId == albumId &&
     other.allowDownload == allowDownload &&
     other.allowUpload == allowUpload &&
     other.assetIds == assetIds &&
     other.description == description &&
     other.expiresAt == expiresAt &&
     other.showExif == showExif &&
     other.type == type;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (albumId == null ? 0 : albumId!.hashCode) +
    (allowDownload.hashCode) +
    (allowUpload.hashCode) +
    (assetIds.hashCode) +
    (description == null ? 0 : description!.hashCode) +
    (expiresAt == null ? 0 : expiresAt!.hashCode) +
    (showExif.hashCode) +
    (type.hashCode);

  @override
  String toString() => 'SharedLinkCreateDto[albumId=$albumId, allowDownload=$allowDownload, allowUpload=$allowUpload, assetIds=$assetIds, description=$description, expiresAt=$expiresAt, showExif=$showExif, type=$type]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.albumId != null) {
      json[r'albumId'] = this.albumId;
    } else {
    //  json[r'albumId'] = null;
    }
      json[r'allowDownload'] = this.allowDownload;
      json[r'allowUpload'] = this.allowUpload;
      json[r'assetIds'] = this.assetIds;
    if (this.description != null) {
      json[r'description'] = this.description;
    } else {
    //  json[r'description'] = null;
    }
    if (this.expiresAt != null) {
      json[r'expiresAt'] = this.expiresAt!.toUtc().toIso8601String();
    } else {
    //  json[r'expiresAt'] = null;
    }
      json[r'showExif'] = this.showExif;
      json[r'type'] = this.type;
    return json;
  }

  /// Returns a new [SharedLinkCreateDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SharedLinkCreateDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      return SharedLinkCreateDto(
        albumId: mapValueOfType<String>(json, r'albumId'),
        allowDownload: mapValueOfType<bool>(json, r'allowDownload') ?? true,
        allowUpload: mapValueOfType<bool>(json, r'allowUpload') ?? false,
        assetIds: json[r'assetIds'] is List
            ? (json[r'assetIds'] as List).cast<String>()
            : const [],
        description: mapValueOfType<String>(json, r'description'),
        expiresAt: mapDateTime(json, r'expiresAt', ''),
        showExif: mapValueOfType<bool>(json, r'showExif') ?? true,
        type: SharedLinkType.fromJson(json[r'type'])!,
      );
    }
    return null;
  }

  static List<SharedLinkCreateDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SharedLinkCreateDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SharedLinkCreateDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SharedLinkCreateDto> mapFromJson(dynamic json) {
    final map = <String, SharedLinkCreateDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SharedLinkCreateDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SharedLinkCreateDto-objects as value to a dart map
  static Map<String, List<SharedLinkCreateDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SharedLinkCreateDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SharedLinkCreateDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'type',
  };
}

