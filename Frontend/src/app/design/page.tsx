"use client";

import { useState } from "react";
import { BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CursorPagination } from "@/components/ui/Pagination";
import { GaugeRing, LevelMeter, ProgressBar } from "@/components/ui/Progress";
import { EmptyState, ErrorState, SkeletonCard, SkeletonText, Spinner } from "@/components/ui/States";
import { Table, TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";
import { BarChart, CompetencyRadar, LineChart, Sparkline } from "@/components/charts/Charts";
import { Heatmap } from "@/components/charts/Heatmap";
import { PageHeader } from "@/components/layout/PageHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { DomainBadge, SeverityBadge, StatTile } from "@/components/domain";

/**
 * Internal design-system reference. Not linked from the app navigation — it
 * exists so every primitive can be checked in light and dark mode at once,
 * before it is used on a real page.
 */
export default function DesignPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const radarData = [
    { label: "Statistical", current: 3.1, required: 3.8 },
    { label: "Technical", current: 2.2, required: 3.6 },
    { label: "Digital Gov.", current: 2.8, required: 3.4 },
    { label: "Behavioural", current: 3.4, required: 3.5 },
  ];

  return (
    <>
      <PublicHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title="Design system"
          description="Every primitive in one place. Toggle the theme in the header to check both palettes."
          breadcrumbs={[{ label: "Internal" }, { label: "Design system" }]}
        />

        <div className="space-y-10">
          <Section title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="accent">Accent</Button>
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </Section>

          <Section title="Badges and domain markers">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Neutral</Badge>
              <Badge tone="primary">Primary</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="danger">Danger</Badge>
              <Badge tone="accent">Accent</Badge>
              <SeverityBadge severity="critical" />
              <SeverityBadge severity="high" />
              <SeverityBadge severity="moderate" />
              <SeverityBadge severity="low" />
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <DomainBadge domain="statistical" />
              <DomainBadge domain="technical" />
              <DomainBadge domain="digital_governance" />
              <DomainBadge domain="behavioural" />
            </div>
          </Section>

          <Section title="Form controls">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" placeholder="Priya Sharma" hint="As recorded in your service book" />
              <Input label="Employee code" placeholder="NSO/FOD/2019/4471" error="This code is already registered" />
              <Select label="Designation" defaultValue="">
                <option value="" disabled>Select a designation</option>
                <option>Junior Statistical Officer</option>
                <option>Senior Statistical Officer</option>
                <option>Deputy Director</option>
              </Select>
              <Textarea label="Current assignment" placeholder="Describe your present responsibilities" />
              <Checkbox label="I confirm these details are accurate" />
            </div>
          </Section>

          <Section title="Progress and levels">
            <div className="flex flex-wrap items-center gap-8">
              <GaugeRing value={72} label="Competency score" sublabel="of 100" />
              <div className="w-64 space-y-3">
                <ProgressBar value={35} label="Course progress" />
                <ProgressBar value={68} tone="success" label="Completion" />
                <ProgressBar value={88} tone="warning" label="Capacity" />
              </div>
              <div className="space-y-2">
                <LevelMeter current={2} required={4} />
                <LevelMeter current={4} required={4} />
                <LevelMeter current={0} required={3} />
              </div>
            </div>
          </Section>

          <Section title="Stat tiles">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Total officials" value={241} icon={<Users className="size-4" />} delta={4.2} deltaLabel="vs last quarter" />
              <StatTile label="Average competency" value={68.4} unit="/100" delta={2.1} deltaLabel="pts" />
              <StatTile label="Completion rate" value="72%" delta={-1.4} deltaLabel="pts" />
              <StatTile label="Courses" value={39} icon={<BookOpen className="size-4" />} hint="Across iGOT and TPAC" />
            </div>
          </Section>

          <Section title="Charts">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader title="Competency radar" description="Current versus required, by domain" />
                <CardBody>
                  <CompetencyRadar data={radarData} />
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Learning hours" description="Last six months" />
                <CardBody>
                  <LineChart
                    data={[
                      { month: "Apr", hours: 12 }, { month: "May", hours: 18 }, { month: "Jun", hours: 9 },
                      { month: "Jul", hours: 24 }, { month: "Aug", hours: 21 }, { month: "Sep", hours: 16 },
                    ]}
                    xKey="month"
                    lines={[{ key: "hours", name: "Hours" }]}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Gap distribution" description="Officials affected, by competency" />
                <CardBody>
                  <BarChart
                    data={[
                      { name: "AI / ML", officials: 168 }, { name: "Cloud", officials: 141 },
                      { name: "Data Privacy", officials: 122 }, { name: "GIS", officials: 96 },
                    ]}
                    xKey="name"
                    bars={[{ key: "officials", name: "Officials" }]}
                    layout="vertical"
                  />
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Competency heatmap" description="Average level by department and domain" />
                <CardBody>
                  <Heatmap
                    rows={["MoSPI — NSO", "DES Maharashtra", "NSSTA"]}
                    columns={[
                      { key: "statistical", label: "Statistical" },
                      { key: "technical", label: "Technical" },
                      { key: "digital_governance", label: "Digital Gov." },
                      { key: "behavioural", label: "Behavioural" },
                    ]}
                    cells={[
                      { row: "MoSPI — NSO", column: "statistical", value: 3.4 },
                      { row: "MoSPI — NSO", column: "technical", value: 2.1 },
                      { row: "MoSPI — NSO", column: "digital_governance", value: 2.6 },
                      { row: "MoSPI — NSO", column: "behavioural", value: 3.1 },
                      { row: "DES Maharashtra", column: "statistical", value: 3.0 },
                      { row: "DES Maharashtra", column: "technical", value: 1.8 },
                      { row: "DES Maharashtra", column: "digital_governance", value: 2.2 },
                      { row: "DES Maharashtra", column: "behavioural", value: 2.9 },
                      { row: "NSSTA", column: "statistical", value: 3.8 },
                      { row: "NSSTA", column: "technical", value: 2.7 },
                      { row: "NSSTA", column: "digital_governance", value: 3.0 },
                      { row: "NSSTA", column: "behavioural", value: 4.1 },
                    ]}
                  />
                </CardBody>
              </Card>
            </div>
            <div className="mt-4 w-40">
              <Sparkline data={[{ value: 2 }, { value: 3 }, { value: 3 }, { value: 4 }, { value: 5 }]} />
            </div>
          </Section>

          <Section title="Tabs">
            <Tabs defaultValue="one">
              <TabList>
                <Tab value="one" count={12}>In progress</Tab>
                <Tab value="two" count={5}>Completed</Tab>
                <Tab value="three">Bookmarked</Tab>
              </TabList>
              <TabPanel value="one"><p className="text-sm text-foreground-muted">First panel. Use the arrow keys to move between tabs.</p></TabPanel>
              <TabPanel value="two"><p className="text-sm text-foreground-muted">Second panel.</p></TabPanel>
              <TabPanel value="three"><p className="text-sm text-foreground-muted">Third panel.</p></TabPanel>
            </Tabs>
          </Section>

          <Section title="Table">
            <TableWrap>
              <Table caption="Sample officials">
                <thead>
                  <tr><Th>Name</Th><Th>Designation</Th><Th>Score</Th><Th>Critical gaps</Th></tr>
                </thead>
                <tbody>
                  <Tr><Td>Priya Sharma</Td><Td>Junior Statistical Officer</Td><Td className="tabular-nums">68.4</Td><Td>3</Td></Tr>
                  <Tr><Td>Anil Kumar</Td><Td>Senior Statistical Officer</Td><Td className="tabular-nums">74.1</Td><Td>1</Td></Tr>
                  <Tr><Td>Meera Patil</Td><Td>Data Analyst</Td><Td className="tabular-nums">59.7</Td><Td>5</Td></Tr>
                </tbody>
              </Table>
            </TableWrap>
            <CursorPagination hasPrevious hasMore shown={3} total={241} />
          </Section>

          <Section title="States">
            <div className="grid gap-4 lg:grid-cols-3">
              <SkeletonCard />
              <EmptyState title="No courses yet" description="Enrol in a course from the catalogue and it will appear here." action={<Button size="sm">Browse catalogue</Button>} />
              <ErrorState onRetry={() => {}} />
            </div>
            <div className="mt-4 flex items-center gap-6">
              <Spinner />
              <SkeletonText className="w-64" />
            </div>
          </Section>

          <Section title="Modal">
            <Button onClick={() => setModalOpen(true)}>Open dialog</Button>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Nominate officials"
              description="They will be notified and the seats reserved immediately."
              footer={
                <>
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => setModalOpen(false)}>Confirm</Button>
                </>
              }
            >
              <p className="text-sm text-foreground-muted">
                Escape closes this dialog, focus is trapped inside it, and clicking the backdrop dismisses it.
              </p>
            </Modal>
          </Section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">{title}</h2>
      {children}
    </section>
  );
}
