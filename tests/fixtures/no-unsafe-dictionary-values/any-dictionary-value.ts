type TenantSettings = Record<string, any>;

declare function loadTenantSettings(): Promise<TenantSettings>;

export async function loadSettingsByTenant(): Promise<TenantSettings> {
  const settingsByTenant: TenantSettings = await loadTenantSettings();

  return settingsByTenant;
}
