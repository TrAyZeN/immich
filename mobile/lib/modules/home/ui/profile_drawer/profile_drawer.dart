import 'package:auto_route/auto_route.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:immich_mobile/modules/backup/providers/backup.provider.dart';
import 'package:immich_mobile/modules/backup/providers/manual_upload.provider.dart';
import 'package:immich_mobile/modules/home/ui/profile_drawer/profile_drawer_header.dart';
import 'package:immich_mobile/modules/home/ui/profile_drawer/server_info_box.dart';
import 'package:immich_mobile/modules/login/providers/authentication.provider.dart';
import 'package:immich_mobile/routing/router.dart';
import 'package:immich_mobile/shared/providers/asset.provider.dart';
import 'package:immich_mobile/shared/providers/server_info.provider.dart';
import 'package:immich_mobile/shared/providers/websocket.provider.dart';

class ProfileDrawer extends HookConsumerWidget {
  const ProfileDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trashEnabled =
        ref.watch(serverInfoProvider.select((v) => v.serverFeatures.trash));

    buildSignOutButton() {
      return ListTile(
        leading: SizedBox(
          height: double.infinity,
          child: Icon(
            Icons.logout_rounded,
            color: Theme.of(context).textTheme.labelMedium?.color,
            size: 20,
          ),
        ),
        title: Text(
          "profile_drawer_sign_out",
          style: Theme.of(context)
              .textTheme
              .labelLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ).tr(),
        onTap: () async {
          await ref.watch(authenticationProvider.notifier).logout();

          ref.read(manualUploadProvider.notifier).cancelBackup();
          ref.watch(backupProvider.notifier).cancelBackup();
          ref.watch(assetProvider.notifier).clearAllAsset();
          ref.watch(websocketProvider.notifier).disconnect();
          AutoRouter.of(context).replace(const LoginRoute());
        },
      );
    }

    buildSettingButton() {
      return ListTile(
        leading: SizedBox(
          height: double.infinity,
          child: Icon(
            Icons.settings_rounded,
            color: Theme.of(context).textTheme.labelMedium?.color,
            size: 20,
          ),
        ),
        title: Text(
          "profile_drawer_settings",
          style: Theme.of(context)
              .textTheme
              .labelLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ).tr(),
        onTap: () {
          AutoRouter.of(context).push(const SettingsRoute());
        },
      );
    }

    buildAppLogButton() {
      return ListTile(
        leading: SizedBox(
          height: double.infinity,
          child: Icon(
            Icons.assignment_outlined,
            color: Theme.of(context).textTheme.labelMedium?.color,
            size: 20,
          ),
        ),
        title: Text(
          "profile_drawer_app_logs",
          style: Theme.of(context)
              .textTheme
              .labelLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ).tr(),
        onTap: () {
          AutoRouter.of(context).push(const AppLogRoute());
        },
      );
    }

    buildTrashButton() {
      return ListTile(
        leading: SizedBox(
          height: double.infinity,
          child: Icon(
            Icons.delete_rounded,
            color: Theme.of(context).textTheme.labelMedium?.color,
            size: 20,
          ),
        ),
        title: Text(
          "Trash",
          style: Theme.of(context)
              .textTheme
              .labelLarge
              ?.copyWith(fontWeight: FontWeight.bold),
        ).tr(),
        onTap: () {
          AutoRouter.of(context).push(const TrashRoute());
        },
      );
    }

    return Drawer(
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.zero,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          ListView(
            shrinkWrap: true,
            padding: EdgeInsets.zero,
            children: [
              const ProfileDrawerHeader(),
              buildSettingButton(),
              buildAppLogButton(),
              if (trashEnabled) buildTrashButton(),
              buildSignOutButton(),
            ],
          ),
          const ServerInfoBox(),
        ],
      ),
    );
  }
}
