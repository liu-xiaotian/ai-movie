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
  const modalTitle = initialProjectName || "新建项目";

  return (
    <RouteDialog title={modalTitle} description="">
      <NewProjectWizard
        autoCreateProject={autoCreateProject}
        initialProjectName={initialProjectName}
        mode="modal"
      />
    </RouteDialog>
  );
}
