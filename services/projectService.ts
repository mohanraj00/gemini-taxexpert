
import { AppState } from '../types';

const CURRENT_STATE_VERSION = 1;

/**
 * Upgrades a loaded state object to the current version.
 * This ensures backward compatibility with older project files.
 * @param loadedState The raw state object loaded from a file.
 * @returns An AppState object conforming to the current application version.
 */
const migrateState = (loadedState: any): AppState => {
    if (!loadedState || typeof loadedState !== 'object') {
        throw new Error("Invalid project file format.");
    }

    // Version 1 Migration
    if (loadedState.version === 1) {
        return {
            version: CURRENT_STATE_VERSION,
            chatHistory: loadedState.chatHistory || [],
            researchAnalyses: loadedState.researchAnalyses || {},
            cachedDocuments: loadedState.cachedDocuments || {},
            objectives: loadedState.objectives || [],
            completedObjectives: loadedState.completedObjectives || [],
            isAwaitingObjectives: loadedState.isAwaitingObjectives || false,
        };
    }
    
    // In the future, add migration logic for other versions here.
    // Example:
    // if (loadedState.version === 2) { ... }
    
    // If the version is unknown or unsupported, throw an error.
    throw new Error(`Unsupported project file version: ${loadedState.version}`);
};

/**
 * Saves the current application state to a .taxproj file.
 * @param state The current application state to save.
 */
export const saveProject = (state: Omit<AppState, 'version'>): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const stateToSave: AppState = {
                ...state,
                version: CURRENT_STATE_VERSION,
            };
            const jsonString = JSON.stringify(stateToSave, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'tax-inference-project.taxproj';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            resolve();
        } catch (err) {
            const detail = err instanceof Error ? err.message : "An unexpected error occurred.";
            console.error("Save project error:", detail);
            reject(new Error(`Failed to save project. ${detail}`));
        }
    });
};

/**
 * Loads and migrates application state from a .taxproj file.
 * @param file The .taxproj file to load.
 * @returns A promise that resolves with the migrated AppState.
 */
export const loadProject = (file: File): Promise<AppState> => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No file provided."));
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                if (!text) {
                    throw new Error("File is empty.");
                }
                const loadedState = JSON.parse(text);
                const migratedState = migrateState(loadedState);
                resolve(migratedState);
            } catch (err) {
                const detail = err instanceof Error ? err.message : "An unexpected error occurred.";
                console.error("Load project error:", detail);
                reject(new Error(`Failed to load project file. ${detail}`));
            }
        };
        reader.onerror = () => {
            reject(new Error("Error reading the project file."));
        };
        reader.readAsText(file);
    });
};