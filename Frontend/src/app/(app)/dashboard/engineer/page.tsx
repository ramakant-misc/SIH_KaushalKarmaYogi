import { Activity, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Table, TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { StatTile, formatDate } from "@/components/domain";
import { PageHeader } from "@/components/layout/PageHeader";
import { systemApi } from "@/lib/api";
import { ENDPOINT_REGISTRY, LIVE_ENDPOINT_COUNT, MOCK_ENDPOINT_COUNT } from "@/lib/api/registry";

export const metadata = { title: "Engineer dashboard" };

const STATUS_TONE = {
  healthy: "success", degraded: "warning", down: "danger", unknown: "neutral",
} as const;

export default async function EngineerDashboard() {
  const health = await systemApi.getSystemHealth();

  const degraded = health.services.filter((s) => s.status !== "healthy");
  const failedJobs = health.queues.reduce((sum, q) => sum + q.failed24h, 0);

  return (
    <>
      <PageHeader
        title="Platform health"
        description="Service status, background jobs, integrations and the API contract's live progress."
        action={<ButtonLink href="/engineer/integrations" variant="secondary">Integrations</ButtonLink>}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Uptime (30 days)" value={health.uptimePercent30d} unit="%" icon={<Activity className="size-4" />} />
        <StatTile
          label="Services degraded" value={degraded.length}
          icon={degraded.length ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}
          hint={degraded.length ? degraded.map((s) => s.name).join(", ") : "All services healthy"}
        />
        <StatTile label="Failed jobs (24h)" value={failedJobs} icon={<RefreshCw className="size-4" />} />
        <StatTile
          label="Endpoints live" value={`${LIVE_ENDPOINT_COUNT}/${ENDPOINT_REGISTRY.length}`}
          hint={`${MOCK_ENDPOINT_COUNT} still served from mocks`}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Services" description="Latency and error rate per dependency" />
          <CardBody className="p-0">
            <TableWrap className="rounded-none border-0">
              <Table caption="Service health" className="min-w-[32rem]">
                <thead>
                  <tr><Th>Service</Th><Th>Status</Th><Th className="text-right">p95</Th><Th className="text-right">Errors</Th></tr>
                </thead>
                <tbody>
                  {health.services.map((service) => (
                    <Tr key={service.key}>
                      <Td>
                        <p className="font-medium">{service.name}</p>
                        {service.message && (
                          <p className="mt-0.5 max-w-xs text-xs text-foreground-subtle">{service.message}</p>
                        )}
                      </Td>
                      <Td><Badge tone={STATUS_TONE[service.status]}>{service.status}</Badge></Td>
                      <Td className="text-right tabular-nums">{service.latencyP95Ms === null ? "—" : `${service.latencyP95Ms} ms`}</Td>
                      <Td className="text-right tabular-nums">{service.errorRatePercent === null ? "—" : `${service.errorRatePercent}%`}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Background queues" description="Depth and recent failures" />
          <CardBody className="p-0">
            <TableWrap className="rounded-none border-0">
              <Table caption="Queue status" className="min-w-[30rem]">
                <thead>
                  <tr><Th>Queue</Th><Th className="text-right">Pending</Th><Th className="text-right">Running</Th><Th className="text-right">Failed 24h</Th></tr>
                </thead>
                <tbody>
                  {health.queues.map((queue) => (
                    <Tr key={queue.key}>
                      <Td className="font-medium">{queue.name}</Td>
                      <Td className="text-right tabular-nums">{queue.pending}</Td>
                      <Td className="text-right tabular-nums">{queue.running}</Td>
                      <Td className="text-right tabular-nums">
                        {queue.failed24h > 0 ? (
                          <span className="font-semibold text-danger-600">{queue.failed24h}</span>
                        ) : (
                          queue.failed24h
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader
          title="Integrations"
          description="iGOT Karmayogi, NSSTA TPAC and identity"
          action={<ButtonLink href="/engineer/integrations" size="sm" variant="secondary">Manage</ButtonLink>}
        />
        <CardBody className="p-0">
          <TableWrap className="rounded-none border-0">
            <Table caption="Integration status">
              <thead>
                <tr><Th>Integration</Th><Th>Connected</Th><Th>Last sync</Th><Th className="text-right">Records</Th><Th>Credential expires</Th></tr>
              </thead>
              <tbody>
                {health.integrations.map((integration) => (
                  <Tr key={integration.key}>
                    <Td>
                      <p className="font-medium">{integration.name}</p>
                      {integration.message && (
                        <p className="mt-0.5 max-w-md text-xs text-foreground-subtle">{integration.message}</p>
                      )}
                    </Td>
                    <Td>
                      <Badge tone={integration.isConnected ? "success" : "neutral"}>
                        {integration.isConnected ? "Connected" : "Not configured"}
                      </Badge>
                    </Td>
                    <Td className="text-foreground-subtle">
                      {integration.lastSyncAt ? formatDate(integration.lastSyncAt) : "Never"}
                      {integration.lastSyncStatus !== "never_run" && (
                        <Badge
                          className="ml-2"
                          tone={
                            integration.lastSyncStatus === "success" ? "success"
                              : integration.lastSyncStatus === "partial" ? "warning" : "danger"
                          }
                        >
                          {integration.lastSyncStatus}
                        </Badge>
                      )}
                    </Td>
                    <Td className="text-right tabular-nums">{integration.recordsSynced ?? "—"}</Td>
                    <Td className="text-foreground-subtle">
                      {integration.credentialExpiresAt ? formatDate(integration.credentialExpiresAt) : "—"}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardBody>
      </Card>

      <Card className="mt-5">
        <CardHeader
          title="API contract progress"
          description="Every endpoint the frontend consumes, and whether the backend has taken it live"
          action={<ButtonLink href="/engineer/api-registry" size="sm" variant="secondary">Full registry</ButtonLink>}
        />
        <CardBody>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-success-500"
                style={{ width: `${(LIVE_ENDPOINT_COUNT / ENDPOINT_REGISTRY.length) * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-sm tabular-nums text-foreground-subtle">
              {LIVE_ENDPOINT_COUNT} of {ENDPOINT_REGISTRY.length} live
            </span>
          </div>
          <p className="text-sm text-foreground-subtle">
            The frontend is running entirely on contract-shaped mock data. As the backend team ships
            an endpoint, its row flips to <Badge tone="success">LIVE</Badge> and the mock branch is
            deleted — no UI changes required.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
