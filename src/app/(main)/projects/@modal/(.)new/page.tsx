import NewProjectWizard from "@/components/projects/NewProjectWizard";
import RouteDialog from "@/components/ui/RouteDialog";
import {
  getNewProjectPrefill,
  type NewProjectSearchParams,
} from "@/lib/new-project-prefill";

export default async function NewProjectModalPage({
  searchParams,
}: {
  searchParams: Promise<NewProjectSearchParams>;
}) {
  const { autoCreateProject, initialProjectName } = getNewProjectPrefill(
    await searchParams,
  );

  return (
    <RouteDialog
      title="新建项目"
      description="在不改变原有三步流程的前提下，以弹框方式完成项目创建。"
    >
      <NewProjectWizard
        autoCreateProject={autoCreateProject}
        initialProjectName={initialProjectName}
        mode="modal"
      />
    </RouteDialog>
  );
}
