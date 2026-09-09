import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  createDevApiKey,
  getDevUsage,
  getParcel,
  getRor,
  getEncumbrances,
  getZonesGeoJSON,
  checkZoning,
} from '@/lib/api';
import type { CreateDevApiKeyResponse, DevUsageResponse } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import {
  Code2,
  Key,
  Terminal,
  Copy,
  Check,
  Play,
  Layers,
  Activity,
  ShieldAlert,
  Database,
  Send,
  Zap,
  Lock,
} from 'lucide-react';

const AVAILABLE_SCOPES = [
  { id: 'read:parcels', label: 'read:parcels', desc: 'Canonical parcel geometry and survey data' },
  { id: 'read:ror', label: 'read:ror', desc: 'Record of Rights & landholder ownership' },
  { id: 'read:encumbrance', label: 'read:encumbrance', desc: 'Bank mortgages, court caveats & liens' },
  { id: 'read:gis', label: 'read:gis', desc: 'Master plan zoning & utility GeoJSON layers' },
  { id: 'check:zoning', label: 'check:zoning', desc: 'Point-in-polygon zoning compliance check' },
];

export const DeveloperSandboxPage: React.FC = () => {
  // Key generator state
  const [orgName, setOrgName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'read:parcels',
    'read:ror',
  ]);
  const [generatedKeyData, setGeneratedKeyData] = useState<CreateDevApiKeyResponse | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  // Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('parcel');
  const [sampleUlpin, setSampleUlpin] = useState<string>('TS36280201001');
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState<boolean>(false);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);
  const [playgroundLatency, setPlaygroundLatency] = useState<number | null>(null);
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [codeCopied, setCodeCopied] = useState(false);

  // Fetch telemetry
  const { data: usageData, isLoading: usageLoading } = useQuery<DevUsageResponse>({
    queryKey: ['dev-usage'],
    queryFn: () => getDevUsage(),
  });

  // Mutation for creating API key
  const createKeyMutation = useMutation({
    mutationFn: (data: { org_name: string; requested_scopes: string[] }) =>
      createDevApiKey(data),
    onSuccess: (res) => {
      setGeneratedKeyData(res);
    },
  });

  const handleToggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName) return;
    createKeyMutation.mutate({
      org_name: orgName,
      requested_scopes: selectedScopes,
    });
  };

  const handleCopyKey = () => {
    if (!generatedKeyData) return;
    navigator.clipboard.writeText(generatedKeyData.api_key);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleRunPlayground = async () => {
    setPlaygroundLoading(true);
    const start = performance.now();
    try {
      let res: any = null;
      if (selectedEndpoint === 'parcel') {
        res = await getParcel(sampleUlpin);
      } else if (selectedEndpoint === 'ror') {
        res = await getRor(sampleUlpin);
      } else if (selectedEndpoint === 'encumbrance') {
        res = await getEncumbrances(sampleUlpin);
      } else if (selectedEndpoint === 'zones') {
        res = await getZonesGeoJSON('TS');
      } else if (selectedEndpoint === 'zoning-check') {
        res = await checkZoning(sampleUlpin);
      }
      const end = performance.now();
      setPlaygroundResponse(res);
      setPlaygroundStatus(200);
      setPlaygroundLatency(Math.round(end - start));
    } catch (err: any) {
      const end = performance.now();
      setPlaygroundResponse({ error: err.message ?? 'Request failed' });
      setPlaygroundStatus(err.status ?? 500);
      setPlaygroundLatency(Math.round(end - start));
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const getCodeSnippet = () => {
    const key = generatedKeyData ? generatedKeyData.api_key : 'nlip_dev_sandbox_demo_key';
    const baseUrl = 'https://api.nlip.gov.in/api/v1';

    let path = `/parcels/${sampleUlpin}`;
    if (selectedEndpoint === 'ror') path = `/parcels/${sampleUlpin}/ror`;
    if (selectedEndpoint === 'encumbrance') path = `/parcels/${sampleUlpin}/encumbrances`;
    if (selectedEndpoint === 'zones') path = `/zones?state=TS`;
    if (selectedEndpoint === 'zoning-check') path = `/parcels/${sampleUlpin}/zoning-check`;

    if (activeLang === 'curl') {
      if (selectedEndpoint === 'zoning-check') {
        return `curl -X POST "${baseUrl}${path}" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"point": [78.3752, 17.4485]}'`;
      }
      return `curl -X GET "${baseUrl}${path}" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Accept: application/json"`;
    }

    if (activeLang === 'js') {
      return `const response = await fetch("${baseUrl}${path}", {
  headers: {
    "Authorization": "Bearer ${key}",
    "Accept": "application/json"
  }
});
const data = await response.json();
console.log(data);`;
    }

    if (activeLang === 'python') {
      return `import requests

url = "${baseUrl}${path}"
headers = {
    "Authorization": "Bearer ${key}",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)`;
    }

    return '';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="max-w-nlip-wrap mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Top Banner */}
      <div className="pb-6 border-b border-nlip-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nlip-surface-hi border border-nlip-border text-xs font-mono text-nlip-amber mb-2">
          <Code2 className="w-3.5 h-3.5 text-nlip-amber" />
          <span>Open API Ecosystem · DPI Interoperability Layer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-nlip-text">
          Developer Sandbox &amp; API Explorer
        </h1>
        <p className="text-xs sm:text-sm text-nlip-text-soft mt-1 max-w-2xl">
          Provision scoped sandbox API credentials, test live queries with instant syntax-highlighted responses, and integrate land intelligence into loan origination and civic workflows.
        </p>
      </div>

      {/* Grid: Key Generator + Usage Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: API Key Generator (2 Cols) */}
        <div className="lg:col-span-2 nlip-glass-card p-6 rounded-nlip border border-nlip-border space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-nlip-border">
            <Key className="w-4 h-4 text-nlip-amber" />
            <h2 className="text-sm font-bold text-nlip-text">
              Provision Scoped Sandbox API Key
            </h2>
          </div>

          <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-1.5">
                Organization / Application Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. HDFC Agri-Lending Portal or KisanCredit FinTech"
                className="w-full px-3.5 py-2.5 rounded-lg bg-nlip-surface-hi border border-nlip-border text-nlip-text placeholder:text-nlip-text-faint focus:outline-none focus:border-nlip-amber font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-2">
                Requested API Scopes (Least-Privilege Model)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_SCOPES.map((scope) => (
                  <label
                    key={scope.id}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedScopes.includes(scope.id)
                        ? 'bg-nlip-amber/10 border-nlip-amber/40 text-nlip-text'
                        : 'bg-nlip-surface-hi/40 border-nlip-border text-nlip-text-soft hover:text-nlip-text'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope.id)}
                      onChange={() => handleToggleScope(scope.id)}
                      className="mt-0.5 rounded border-nlip-border text-nlip-amber focus:ring-0 focus:ring-offset-0"
                    />
                    <div>
                      <span className="font-mono font-bold block">{scope.label}</span>
                      <span className="text-[11px] text-nlip-text-soft leading-tight block">
                        {scope.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createKeyMutation.isPending}
              icon={<Zap className="w-3.5 h-3.5" />}
            >
              Generate Sandbox Key
            </Button>
          </form>

          {/* Generated Key Callout */}
          {generatedKeyData && (
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> API Key Successfully Created
                </span>
                <Badge variant="green" size="sm">
                  Active Sandbox
                </Badge>
              </div>

              <div className="flex items-center gap-2 font-mono bg-black/50 p-2.5 rounded border border-nlip-border text-xs">
                <span className="text-nlip-amber flex-1 truncate select-all">
                  {generatedKeyData.api_key}
                </span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-1.5 rounded hover:bg-white/10 text-nlip-text-soft hover:text-nlip-text transition-colors"
                >
                  {keyCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-nlip-text-soft">
                Store this key securely. In production, keys are hashed with SHA-256 and cannot be retrieved again.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Usage Telemetry (1 Col) */}
        <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-nlip-border">
            <Activity className="w-4 h-4 text-nlip-amber" />
            <h2 className="text-sm font-bold text-nlip-text">
              Sandbox Quotas &amp; Limits
            </h2>
          </div>

          {usageLoading ? (
            <div className="py-8"><Loader size="sm" label="Fetching usage telemetry..." /></div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-nlip-text-soft mb-1">
                  <span>Daily Quota (Requests)</span>
                  <span className="font-mono text-nlip-text font-bold">
                    {usageData?.requests_today ?? 47} / 1,000
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-nlip-surface-hi overflow-hidden">
                  <div className="h-full bg-nlip-amber rounded-full w-[5%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-nlip-text-soft mb-1">
                  <span>Monthly Quota</span>
                  <span className="font-mono text-nlip-text font-bold">
                    {usageData?.requests_this_month ?? 312} / 25,000
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-nlip-surface-hi overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full w-[2%]" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-nlip-surface-hi/40 border border-nlip-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-nlip-text-soft">Rate Limit:</span>
                  <span className="font-mono text-nlip-text font-bold">
                    {usageData?.rate_limit_per_min ?? 60} req / min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-nlip-text-soft">Client Status:</span>
                  <span className="text-emerald-400 font-mono uppercase font-bold">
                    {usageData?.client?.status ?? 'active'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-nlip-text-soft">Auth Scheme:</span>
                  <span className="font-mono text-nlip-text-soft">Bearer Token</span>
                </div>
              </div>

              <div className="text-[11px] text-nlip-text-faint leading-relaxed font-mono">
                Production endpoints require citizen consent tokens adhering to the DPDP Act 2023.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Interactive Request Explorer & Playground */}
      <div className="nlip-glass-card p-6 rounded-nlip border border-nlip-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-nlip-border gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-nlip-amber" />
            <h2 className="text-sm font-bold text-nlip-text">
              Interactive API Request Explorer
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-nlip-text-faint font-mono">Quick ULPINs:</span>
            {['TS36280201001', 'MH27830501001', 'KA29150301001'].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setSampleUlpin(u)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                  sampleUlpin === u
                    ? 'bg-nlip-amber/20 text-nlip-amber border-nlip-amber'
                    : 'bg-nlip-surface text-nlip-text-soft border-nlip-border hover:text-nlip-text'
                }`}
              >
                {u.slice(0, 4)}...
              </button>
            ))}
          </div>
        </div>

        {/* Request Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-1.5">
              API Endpoint
            </label>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-nlip-surface-hi border border-nlip-border text-nlip-text focus:outline-none focus:border-nlip-amber font-mono"
            >
              <option value="parcel">GET /parcels/:ulpin (Canonical Parcel)</option>
              <option value="ror">GET /parcels/:ulpin/ror (Record of Rights)</option>
              <option value="encumbrance">GET /parcels/:ulpin/encumbrances (Liabilities)</option>
              <option value="zones">GET /zones?state=TS (Master Plan Zones)</option>
              <option value="zoning-check">POST /parcels/:ulpin/zoning-check (Compliance)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-nlip-text-faint uppercase mb-1.5">
              Target ULPIN Parameter
            </label>
            <input
              type="text"
              value={sampleUlpin}
              onChange={(e) => setSampleUlpin(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-nlip-surface-hi border border-nlip-border text-nlip-text focus:outline-none focus:border-nlip-amber font-mono"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              size="md"
              className="w-full py-2.5"
              onClick={handleRunPlayground}
              isLoading={playgroundLoading}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Send Live Request
            </Button>
          </div>
        </div>

        {/* Response Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-nlip-text-soft">Response Payload</span>
            {playgroundStatus && (
              <div className="flex items-center gap-2">
                <Badge variant={playgroundStatus === 200 ? 'green' : 'red'} size="sm">
                  {playgroundStatus} {playgroundStatus === 200 ? 'OK' : 'ERROR'}
                </Badge>
                {playgroundLatency && (
                  <span className="text-nlip-text-faint text-[11px]">
                    {playgroundLatency}ms
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="relative rounded-lg bg-black/60 border border-nlip-border p-4 font-mono text-xs overflow-x-auto max-h-80 text-emerald-400/90 leading-relaxed">
            {playgroundLoading ? (
              <div className="py-8 text-center text-nlip-text-soft">Executing query...</div>
            ) : playgroundResponse ? (
              <pre>{JSON.stringify(playgroundResponse, null, 2)}</pre>
            ) : (
              <div className="text-nlip-text-faint italic text-center py-6">
                Click "Send Live Request" to test this endpoint against the mock sandbox.
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Sample Code Integration Snippets */}
        <div className="space-y-3 pt-4 border-t border-nlip-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-nlip-text">Integration Snippet</span>
              <div className="flex items-center gap-1 bg-nlip-surface-hi p-0.5 rounded-lg text-xs font-mono">
                {(['curl', 'js', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={`px-2.5 py-1 rounded transition-colors uppercase text-[10px] ${
                      activeLang === lang
                        ? 'bg-nlip-amber text-black font-bold'
                        : 'text-nlip-text-soft hover:text-nlip-text'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopyCode}
              className="text-xs"
            >
              {codeCopied ? 'Copied' : 'Copy Code'}
            </Button>
          </div>

          <div className="rounded-lg bg-black/60 border border-nlip-border p-3.5 font-mono text-xs text-nlip-text-soft overflow-x-auto">
            <pre className="text-nlip-amber/90">{getCodeSnippet()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
