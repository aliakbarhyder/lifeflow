import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Key,
  Save,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { Card, Button, Input, Toggle, AliAvatar } from '@/components';
import { settingsOps, blockedSitesOps } from '@/store/db';
import type { Settings as SettingsType, BlockedSite, SiteCategory } from '@/types';
import { generateId } from '@/utils/helpers';

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [activeSection, setActiveSection] = useState<'general' | 'focus' | 'ai' | 'data'>('general');

  useEffect(() => {
    loadSettings();
    loadBlockedSites();
  }, []);

  const loadSettings = async () => {
    const s = await settingsOps.get();
    setSettings(s);
  };

  const loadBlockedSites = async () => {
    const sites = await blockedSitesOps.getAll();
    setBlockedSites(sites);
  };

  const updateSetting = async <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await settingsOps.save(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (settings) {
      await settingsOps.save(settings);
    }
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleReset = async () => {
    const defaults: SettingsType = {
      aiProvider: 'openai',
      theme: 'dark',
      notifications: true,
      autoFocus: false,
      focusDuration: 25,
      breakDuration: 5,
      blockedCategories: ['social', 'entertainment'],
      customBlockedSites: [],
    };
    setSettings(defaults);
    await settingsOps.save(defaults);
  };

  const addBlockedSite = async () => {
    if (!newSiteUrl.trim()) return;
    const site: BlockedSite = {
      id: generateId(),
      url: newSiteUrl.trim(),
      name: newSiteUrl.trim(),
      category: 'custom',
      blocked: true,
    };
    await blockedSitesOps.add(site);
    setNewSiteUrl('');
    loadBlockedSites();
  };

  const removeBlockedSite = async (id: string) => {
    await blockedSitesOps.delete(id);
    loadBlockedSites();
  };

  const toggleBlockedSite = async (site: BlockedSite) => {
    await blockedSitesOps.toggle(site.id);
    loadBlockedSites();
  };

  const categories: { value: SiteCategory; label: string }[] = [
    { value: 'social', label: 'Social Media' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'news', label: 'News' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'custom', label: 'Custom' },
  ];

  const sections = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'focus', label: 'Focus Shield', icon: <Shield size={18} /> },
    { id: 'ai', label: 'AI Settings', icon: <Key size={18} /> },
    { id: 'data', label: 'Data & Privacy', icon: <Database size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AliAvatar size="md" animated={false} />
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-gray-400 text-sm">Customize your LifeFlow experience</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            icon={<RotateCcw size={18} />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            icon={<Save size={18} />}
            onClick={handleSave}
            loading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as typeof activeSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-crimson text-white'
                    : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'general' && settings && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell size={18} className="text-purple-400" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <Toggle
                    checked={settings.notifications}
                    onChange={(checked) => updateSetting('notifications', checked)}
                    label="Enable Notifications"
                    description="Get reminders and updates"
                  />
                  <Toggle
                    checked={settings.autoFocus}
                    onChange={(checked) => updateSetting('autoFocus', checked)}
                    label="Auto Focus Mode"
                    description="Automatically start focus sessions"
                  />
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette size={18} className="text-blue-400" />
                  Appearance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-gray-400">Choose your preferred theme</p>
                    </div>
                    <div className="flex gap-2">
                      {(['dark', 'light'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => updateSetting('theme', theme)}
                          className={`px-4 py-2 rounded-xl font-medium transition-all ${
                            settings.theme === theme
                              ? 'bg-crimson text-white'
                              : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe size={18} className="text-green-400" />
                  Timer Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Focus Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.focusDuration}
                      onChange={(e) => updateSetting('focusDuration', parseInt(e.target.value) || 25)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                      min={5}
                      max={120}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.breakDuration}
                      onChange={(e) => updateSetting('breakDuration', parseInt(e.target.value) || 5)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                      min={1}
                      max={30}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'focus' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-crimson" />
                  Blocked Sites
                </h3>
                <div className="space-y-4">
                  {blockedSites.map((site) => (
                    <div
                      key={site.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${site.blocked ? 'bg-red-500' : 'bg-gray-500'}`} />
                        <div>
                          <p className="font-medium">{site.name}</p>
                          <p className="text-sm text-gray-400">{site.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBlockedSite(site)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            site.blocked
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {site.blocked ? 'Blocked' : 'Allowed'}
                        </button>
                        <button
                          onClick={() => removeBlockedSite(site.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-4">
                    <Input
                      placeholder="Enter URL to block..."
                      value={newSiteUrl}
                      onChange={(e) => setNewSiteUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addBlockedSite();
                      }}
                      className="flex-1"
                    />
                    <Button variant="secondary" onClick={addBlockedSite}>
                      Add Site
                    </Button>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold mb-4">Block Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const isBlocked = settings?.blockedCategories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        onClick={() => {
                          if (!settings) return;
                          const newCategories = isBlocked
                            ? settings.blockedCategories.filter((c) => c !== cat.value)
                            : [...settings.blockedCategories, cat.value];
                          updateSetting('blockedCategories', newCategories);
                        }}
                        className={`p-4 rounded-xl text-left transition-all ${
                          isBlocked
                            ? 'bg-crimson/20 border border-crimson/50'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <p className="font-medium">{cat.label}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {isBlocked ? 'Blocked' : 'Click to block'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'ai' && settings && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key size={18} className="text-purple-400" />
                  AI Provider
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'openai', label: 'OpenAI' },
                      { value: 'anthropic', label: 'Anthropic' },
                      { value: 'custom', label: 'Custom' },
                    ].map((provider) => (
                      <button
                        key={provider.value}
                        onClick={() => updateSetting('aiProvider', provider.value as SettingsType['aiProvider'])}
                        className={`p-4 rounded-xl text-center transition-all ${
                          settings.aiProvider === provider.value
                            ? 'bg-crimson text-white'
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                      >
                        {provider.label}
                      </button>
                    ))}
                  </div>

                  {settings.aiProvider === 'custom' && (
                    <Input
                      label="Custom API Endpoint"
                      placeholder="https://api.example.com/v1/chat"
                      value={settings.customEndpoint || ''}
                      onChange={(e) => updateSetting('customEndpoint', e.target.value)}
                    />
                  )}

                  <Input
                    label="API Key"
                    type="password"
                    placeholder="Enter your API key..."
                    value={settings.apiKey || ''}
                    onChange={(e) => updateSetting('apiKey', e.target.value)}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'data' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database size={18} className="text-blue-400" />
                  Data Management
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    All your data is stored locally on your device. LifeFlow AI does not collect any personal information.
                  </p>
                  
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 text-green-400">
                      <AlertTriangle size={18} />
                      <span className="font-medium">Your Privacy is Protected</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      LifeFlow AI stores all data locally using IndexedDB. No data is sent to external servers.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}