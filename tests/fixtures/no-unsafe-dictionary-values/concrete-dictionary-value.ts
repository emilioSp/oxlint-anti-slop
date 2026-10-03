type TenantSettings = {
  timezone: string;
  invoicePrefix: string;
};

declare function loadTenantSettings(): Promise<Record<string, TenantSettings>>;

export async function loadSettingsByTenant(): Promise<
  Record<string, TenantSettings>
> {
  const settingsByTenant: Record<string, TenantSettings> =
    await loadTenantSettings();

  return settingsByTenant;
}
