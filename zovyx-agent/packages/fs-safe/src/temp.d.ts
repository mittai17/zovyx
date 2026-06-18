export declare class TempWorkspace {
    path: string;
    cleanup: () => Promise<void>;
}
export declare class TempWorkspaceSync {
    path: string;
    cleanup: () => void;
}
export declare class TempWorkspaceOptions {
    prefix?: string;
    dir?: string;
}
export declare function tempWorkspace(options?: TempWorkspaceOptions): Promise<TempWorkspace>;
export declare function tempWorkspaceSync(options?: TempWorkspaceOptions): TempWorkspaceSync;
export declare function withTempWorkspace<T>(fn: (workspace: TempWorkspace) => Promise<T>, options?: TempWorkspaceOptions): Promise<T>;
export declare function withTempWorkspaceSync<T>(fn: (workspace: TempWorkspaceSync) => T, options?: TempWorkspaceOptions): T;
