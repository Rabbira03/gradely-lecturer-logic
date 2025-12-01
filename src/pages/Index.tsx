import { CompleteDashboardExample } from "../examples/usageExamples";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-center">Lecturer Module Integration Test</h1>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <CompleteDashboardExample />
        </div>
      </div>
    </div>
  );
};

export default Index;
