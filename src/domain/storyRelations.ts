export interface StoryRelationInput {
  versionId?: string | null;
  epicId?: string | null;
  sprintId?: string | null;
}

export interface StoryRelationValidation {
  ok: boolean;
  message?: string;
}

/** Validates epic↔version and sprint↔version coherence before invoke. */
export function validateStoryRelations(
  input: StoryRelationInput,
  epicVersionIds: string[],
  sprintVersionId?: string | null,
): StoryRelationValidation {
  const { versionId, epicId, sprintId } = input;
  if (versionId && epicId && !epicVersionIds.includes(versionId)) {
    return {
      ok: false,
      message: `O épico ${epicId} não está vinculado à versão ${versionId}.`,
    };
  }
  if (versionId && sprintId && sprintVersionId && sprintVersionId !== versionId) {
    return {
      ok: false,
      message: `O sprint ${sprintId} pertence à versão ${sprintVersionId}, não à ${versionId}.`,
    };
  }
  return { ok: true };
}
