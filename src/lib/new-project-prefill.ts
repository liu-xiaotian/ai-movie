type SearchParamValue = string | string[] | undefined;

export type NewProjectSearchParams = {
  autoStart?: SearchParamValue;
  projectName?: SearchParamValue;
};

function getFirstValue(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export function getNewProjectPrefill(searchParams: NewProjectSearchParams) {
  const projectName = getFirstValue(searchParams.projectName);
  const autoStartValue = getFirstValue(searchParams.autoStart);

  return {
    autoCreateProject:
      projectName.length > 0 &&
      (autoStartValue === "1" || autoStartValue === "true"),
    initialProjectName: projectName,
  };
}
