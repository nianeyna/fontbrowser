interface Font {
    file: string,
    fullName: string,
    subfamilyName: string
}

interface FontDetails {
    features: string[],
    characters: number[],
    characterString: string
}

interface Feature {
    friendlyName?: string,
    registeredBy?: string,
    function?: string,
    example?: string,
    implementation?: string,
    interface?: string,
    suggestion?: string,
    sensitivity?: string,
    interaction?: string
}

interface SearchAndFilterOptions {
    searchTerm?: string,
    characters?: string,
    includedTags: string[],
    excludedTags: string[],
    selectedFeaturesOnly: boolean,
    secretOpenTypeFeatures: boolean
}

interface Settings {
    searchOptions?: SearchAndFilterOptions,
    tags?: [string, string[]][],
    fontFolders?: FontFolder[],
    darkMode?: boolean
}

interface FontFolder {
    folderPath: string,
    subfolders: boolean
}
