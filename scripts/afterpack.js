// electron-builder afterPack hook: patch the Windows exe with the app icon and
// version info in pure JS (resedit) — no wine required on the build host.
import * as fs from 'fs';
import * as path from 'path';
import * as ResEdit from 'resedit';

export default async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;

  const version = context.packager.appInfo.version;
  const productName = context.packager.appInfo.productName;
  const company = 'Burmalda';
  const description = 'Burmalda Launcher — Быстрый модульный лаунчер для Minecraft / Horizon';

  const exePath = path.join(context.appOutDir, `${productName}.exe`);
  const icoPath = path.join(context.packager.projectDir, 'build', 'icon.ico');

  if (!fs.existsSync(exePath)) {
    console.warn(`afterpack: exe not found: ${exePath}`);
    return;
  }
  if (!fs.existsSync(icoPath)) {
    console.warn('afterpack: build/icon.ico not found, skipping icon patch');
    return;
  }

  const data = fs.readFileSync(exePath);
  const exe = ResEdit.NtExecutable.from(data);
  const res = ResEdit.NtExecutableResource.from(exe);

  // --- icon ---
  const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(icoPath));
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  const groupId = groups.length ? groups[0].id : 1;
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    groupId,
    1033,
    iconFile.icons.map((item) => item.data)
  );

  // --- version info ---
  const viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
  const vi = viList[0] || ResEdit.Resource.VersionInfo.fromEmpty(res);
  const [vMajor, vMinor, vPatch] = version.split('.').map((n) => parseInt(n, 10) || 0);
  vi.setFileVersion(vMajor, vMinor, vPatch, 0, 1033);
  vi.setProductVersion(vMajor, vMinor, vPatch, 0, 1033);
  vi.setStringValues(
    { lang: 1033, codepage: 1200 },
    {
      FileDescription: description,
      ProductName: productName,
      CompanyName: company,
      OriginalFilename: `${productName}.exe`,
      InternalName: productName,
      LegalCopyright: `Copyright (c) ${new Date().getFullYear()} ${company}`,
    }
  );
  vi.outputToResourceEntries(res.entries);

  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
  console.log(`afterpack: patched icon + version into ${path.basename(exePath)}`);
}
