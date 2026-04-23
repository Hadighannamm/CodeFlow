export type AdminSetting = {
  id: string
  settingKey: string
  settingValue: string
  dataType: 'string' | 'boolean' | 'number' | 'json'
  description?: string
  updatedById?: string
  createdAt: string
  updatedAt: string
}

export type AdminSettingsInput = {
  settingKey: string
  settingValue: string
  dataType: 'string' | 'boolean' | 'number' | 'json'
  description?: string
}
