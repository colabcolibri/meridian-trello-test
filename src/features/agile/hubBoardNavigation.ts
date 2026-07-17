/** Passed via react-router location.state from ProjectHubPage → board. */
export type HubBoardNavigationState = {
  boardFilters?: {
    versionId?: string | null;
    epicId?: string | null;
  };
};
