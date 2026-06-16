// Declares extension points for agent session type augmentation.
export type ZuvixAgentSessionSkillSourceAugmentation = never;

declare module "zuvix/plugin-sdk/agent-sessions" {
  interface Skill {
    // Zuvix relies on the source identifier returned by skill loaders.
    source: string;
  }
}
