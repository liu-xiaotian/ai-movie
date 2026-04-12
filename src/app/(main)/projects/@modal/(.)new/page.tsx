import NewProjectWizard from "@/components/projects/NewProjectWizard";
import RouteDialog from "@/components/ui/RouteDialog";

export default function NewProjectModalPage() {
  return (
    <RouteDialog
      title="新建项目"
      description="在不改变原有三步流程的前提下，以弹框方式完成项目创建。"
    >
      <NewProjectWizard mode="modal" />
    </RouteDialog>
  );
}
