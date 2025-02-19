import React, { useState } from 'react';
import { Server, Users, Globe, Signal, ChevronDown, ChevronUp, Puzzle, Plug as Plugin } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface ServerStatus {
  online: boolean;
  host: string;
  port: number;
  version: {
    name_raw: string;
    name_clean: string;
    protocol: number;
  };
  players: {
    online: number;
    max: number;
    list: Array<{
      uuid: string;
      name_raw: string;
      name_clean: string;
      name_html: string;
    }>;
  };
  motd: {
    raw: string;
    clean: string;
    html: string;
  };
  icon: string | null;
  mods: Array<{
    name: string;
    version: string;
  }>;
  plugins: Array<{
    name: string;
    version: string | null;
  }>;
}

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function CollapsibleCard({ title, icon, children }: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-light-100 dark:bg-dark-200 rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-light-200 dark:hover:bg-dark-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-minecraft text-sm text-dark-200 dark:text-light-100">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-100 dark:text-light-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-100 dark:text-light-300" />
        )}
      </button>
      {isOpen && <div className="p-4 border-t border-light-300 dark:border-dark-400">{children}</div>}
    </div>
  );
}

function ServerStatusCheck() {
  const [serverAddress, setServerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverInfo, setServerInfo] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation();

  const checkServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.mcstatus.io/v2/status/java/${serverAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch server status');
      }
      const data = await response.json();
      setServerInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check server status');
      setServerInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-20 md:pt-0">
      <h1 className="text-3xl font-minecraft mb-8 text-center text-dark-200 dark:text-light-100">
        {t.server.title}
      </h1>

      <form onSubmit={checkServer} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={serverAddress}
            onChange={(e) => setServerAddress(e.target.value)}
            placeholder={t.common.enterServerAddress}
            className="flex-1 input-base"
          />
          <button
            type="submit"
            disabled={loading || !serverAddress}
            className="button-primary"
          >
            {loading ? t.common.checking : t.server.checkServer}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-center text-red-400 mb-8 bg-light-100 dark:bg-dark-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {serverInfo && (
        <div className="bg-light-200 dark:bg-dark-300 rounded-lg p-6 space-y-6 shadow-sm">
          {/* Server Icon */}
          {serverInfo.icon && (
            <div className="flex justify-center">
              <img
                src={serverInfo.icon}
                alt="Server Icon"
                className="w-16 h-16 rounded"
              />
            </div>
          )}

          {/* MOTD */}
          <div className="bg-light-100 dark:bg-dark-200 p-4 rounded-lg">
            <h3 className="text-sm text-muted-100 dark:text-light-300 mb-2">{t.server.motd}</h3>
            <div 
              className="font-minecraft minecraft-colors"
              dangerouslySetInnerHTML={{ __html: serverInfo.motd.html.replace(/\n/g, '<br>') }}
            />
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Signal className={`w-5 h-5 ${serverInfo.online ? 'text-accent-500' : 'text-red-400'}`} />
              <div>
                <div className="text-sm text-muted-100 dark:text-light-300">{t.common.status}</div>
                <div className="font-minecraft">
                  {serverInfo.online ? (
                    <span className="text-accent-500">{t.common.online}</span>
                  ) : (
                    <span className="text-red-400">{t.common.offline}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-accent-500" />
              <div>
                <div className="text-sm text-muted-100 dark:text-light-300">{t.common.players}</div>
                <div className="font-minecraft text-dark-200 dark:text-light-100">
                  {t.server.playerCount.replace('{online}', serverInfo.players.online.toString()).replace('{max}', serverInfo.players.max.toString())}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-accent-500" />
              <div>
                <div className="text-sm text-muted-100 dark:text-light-300">{t.common.version}</div>
                <div className="font-minecraft text-dark-200 dark:text-light-100">{serverInfo.version.name_clean}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-accent-500" />
              <div>
                <div className="text-sm text-muted-100 dark:text-light-300">{t.common.address}</div>
                <div className="font-minecraft text-sm text-dark-200 dark:text-light-100">
                  {serverInfo.host}:{serverInfo.port}
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Cards */}
          <div className="space-y-4">
            {/* Players List */}
            {serverInfo.players.list && serverInfo.players.list.length > 0 && (
              <CollapsibleCard
                title={t.server.onlinePlayers}
                icon={<Users className="w-5 h-5 text-accent-500" />}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serverInfo.players.list.map((player, index) => (
                    <div 
                      key={player.uuid} 
                      className="font-minecraft text-sm minecraft-colors"
                      dangerouslySetInnerHTML={{ __html: player.name_html }}
                    />
                  ))}
                </div>
              </CollapsibleCard>
            )}

            {/* Mods List */}
            {serverInfo.mods && serverInfo.mods.length > 0 ? (
              <CollapsibleCard
                title={t.server.modCount.replace('{count}', serverInfo.mods.length.toString())}
                icon={<Puzzle className="w-5 h-5 text-accent-500" />}
              >
                <div className="grid grid-cols-1 gap-2">
                  {serverInfo.mods.map((mod, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-minecraft text-sm text-dark-200 dark:text-light-100">{mod.name}</span>
                      <span className="text-sm text-muted-100 dark:text-light-300">{mod.version}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            ) : (
              <div className="text-sm text-muted-100 dark:text-light-300 text-center">
                {t.server.noMods}
              </div>
            )}

            {/* Plugins List */}
            {serverInfo.plugins && serverInfo.plugins.length > 0 ? (
              <CollapsibleCard
                title={t.server.pluginCount.replace('{count}', serverInfo.plugins.length.toString())}
                icon={<Plugin className="w-5 h-5 text-accent-500" />}
              >
                <div className="grid grid-cols-1 gap-2">
                  {serverInfo.plugins.map((plugin, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-minecraft text-sm text-dark-200 dark:text-light-100">{plugin.name}</span>
                      <span className="text-sm text-muted-100 dark:text-light-300">{plugin.version || t.server.unknown}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            ) : (
              <div className="text-sm text-muted-100 dark:text-light-300 text-center">
                {t.server.noPlugins}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServerStatusCheck;